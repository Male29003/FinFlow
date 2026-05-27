using Application.Interface;
using Application.Response;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using MimeKit;
using Microsoft.Extensions.Caching.Memory;
using MailKit.Net.Smtp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features;
public class AuthFeatures
{
    // ---------------------------------------------------
    // 1. GỬI OTP (Dùng chung cho Đăng ký, Quên MK, Đổi MK)
    // ---------------------------------------------------
    public class SendOtp : BaseFeature
    {
        public string Email { get; set; }
        // Purpose có thể là: "Register", "ForgotPassword", "ChangePassword"
        public string Purpose { get; set; }

        public class Handler : BaseHandler<SendOtp>
        {
            private readonly IMemoryCache _cache;
            public Handler(IApplicationDbContext context, IMemoryCache cache) : base(context) { _cache = cache; }

            public async override Task<IResponse> Handle(SendOtp request, CancellationToken cancellationToken)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Email);

                // Ràng buộc theo mục đích
                if (request.Purpose == "Register" && user != null)
                    return new BadRequestResponse("Email này đã được đăng ký!");

                if ((request.Purpose == "ForgotPassword" || request.Purpose == "ChangePassword") && user == null)
                    return new BadRequestResponse("Email không tồn tại trong hệ thống!");

                // Sinh mã OTP 6 số
                Random rand = new Random();
                string otpCode = rand.Next(100000, 999999).ToString();

                // Lưu OTP vào Cache với Key chứa Purpose để tránh dùng lẫn lộn
                _cache.Set($"OTP_{request.Purpose}_{request.Email}", otpCode, TimeSpan.FromMinutes(5));

                // Bắn Email (Dùng MailKit)
                await SendEmailAsync(request.Email, "Mã xác thực OTP FinFlow", $"Mã OTP của bạn là: <b>{otpCode}</b>. Mã có hiệu lực trong 5 phút.");

                return new SuccessResponse("OTP đã được gửi tới Email của bạn.");
            }

            private async Task SendEmailAsync(string toEmail, string subject, string body)
            {
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress("FinFlow App", "nk.dev.admin@gmail.com"));
                email.To.Add(new MailboxAddress("", toEmail));
                email.Subject = subject;
                email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = body };

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync("nk.dev.admin@gmail.com", "okaisoxjnnvskpnr");
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
        }
    }

    // ---------------------------------------------------
    // 2. XÁC THỰC OTP 
    // ---------------------------------------------------
    public class VerifyOtp : BaseFeature
    {
        public string Email { get; set; }
        public string OtpCode { get; set; }
        public string Purpose { get; set; }

        public class Handler : BaseHandler<VerifyOtp>
        {
            private readonly IMemoryCache _cache;
            public Handler(IApplicationDbContext context, IMemoryCache cache) : base(context) { _cache = cache; }

            public async override Task<IResponse> Handle(VerifyOtp request, CancellationToken cancellationToken)
            {
                if (_cache.TryGetValue($"OTP_{request.Purpose}_{request.Email}", out string savedOtp))
                {
                    if (savedOtp == request.OtpCode)
                    {
                        // THÀNH CÔNG: Trả về OK nhưng KHÔNG XÓA cache để bước tiếp theo còn dùng
                        return new SuccessResponse("Xác thực OTP thành công!");
                    }
                    return new BadRequestResponse("Mã OTP không chính xác!");
                }

                return new BadRequestResponse("Mã OTP đã hết hạn hoặc không tồn tại!");
            }
        }
    }

    // ---------------------------------------------------
    // 3. ĐẶT LẠI MẬT KHẨU
    // ---------------------------------------------------
    public class ResetPasswordWithOtp : BaseFeature
    {
        public string Email { get; set; }
        public string OtpCode { get; set; }
        public string NewPassword { get; set; }

        public class Handler : BaseHandler<ResetPasswordWithOtp>
        {
            private readonly IMemoryCache _cache;
            public Handler(IApplicationDbContext context, IMemoryCache cache) : base(context) { _cache = cache; }

            public async override Task<IResponse> Handle(ResetPasswordWithOtp request, CancellationToken cancellationToken)
            {
                // 1. Kiểm tra lại OTP lần cuối để bảo mật tuyệt đối
                if (!_cache.TryGetValue($"OTP_ForgotPassword_{request.Email}", out string savedOtp) || savedOtp != request.OtpCode)
                {
                    return new BadRequestResponse("Xác thực thất bại! Mã OTP không hợp lệ.");
                }

                // 2. Cập nhật mật khẩu
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Email);
                if (user == null) return new BadRequestResponse("Người dùng không tồn tại!");

                user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                _context.Users.Update(user);
                var rowAffected = await _context.SaveChangesAsync(cancellationToken);
                if (rowAffected == 0) {
                    return new BadRequestResponse("Lỗi hệ thống: Không thể lưu mật khẩu mới!!!");
                }

                // 3. Xóa OTP khỏi Cache sau khi đã dùng xong
                _cache.Remove($"OTP_ForgotPassword_{request.Email}");

                return new SuccessResponse("Đổi mật khẩu thành công!");
            }
        }
    }
}
