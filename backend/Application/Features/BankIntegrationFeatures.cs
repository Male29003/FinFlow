using Application.Features;
using Application.Interface;
using Application.Response;
using Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace Application.Features.BankIntegrationFeatures;

public class BankIntegrationFeatures
{
    public class LinkBank : BaseFeature
    {
        public string TenNganHang { get; set; }
        public string SoTaiKhoan { get; set; }
        public bool IsDemo { get; set; }

        public class Handler : BaseHandler<LinkBank>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;
            private readonly ISignalRNotificationService _notificationService;
            public Handler(IApplicationDbContext context,
                           IHttpContextAccessor httpContextAccessor,
                           ISignalRNotificationService notificationService) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
                _notificationService = notificationService;
            }

            public async override Task<IResponse> Handle(LinkBank command, CancellationToken cancellationToken)
            {
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return new BadRequestResponse("Unauthorized");
                int userId = int.Parse(userIdClaim);

                var lienKet = new LienKetNganHang
                {
                    TenNganHang = command.TenNganHang,
                    SoTaiKhoanNganHang = command.SoTaiKhoan,
                    TokenLienKet = Guid.NewGuid().ToString(),
                    UserId = userId
                };
                _context.LienKetNganHangs.Add(lienKet);

                var loaiTk = _context.LoaiTaiKhoan.FirstOrDefault(x => x.IsDeleted == false);
                var taiKhoanMoi = new TaiKhoan
                {
                    TenTaiKhoan = $"{command.TenNganHang} - {command.SoTaiKhoan.Substring(Math.Max(0, command.SoTaiKhoan.Length - 4))}",
                    SoDu = command.IsDemo ? 10000000 : 0,
                    LoaiTaiKhoanId = loaiTk?.Id ?? 0,
                    User = _context.Users.Find(userId),
                    LienKetNganHang = lienKet
                };
                _context.TaiKhoan.Add(taiKhoanMoi);

                await _context.SaveChangesAsync(cancellationToken);
                return new SuccessResponse($"Đã kết nối thành công ngân hàng {command.TenNganHang}.");
            }
        }
    }
}