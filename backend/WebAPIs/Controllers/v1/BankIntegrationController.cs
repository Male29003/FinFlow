using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Interface;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace WebAPIs.Controllers.v1
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/bank-integration")]
    public class BankIntegrationController : BaseApiController
    {
        private readonly IApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ISignalRNotificationService _notificationService;

        public BankIntegrationController(
            IApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ISignalRNotificationService notificationService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }

        /// <summary>
        /// Liên kết ngân hàng (Demo mode: tạo tài khoản ảo với 10 triệu và giao dịch mẫu)
        /// </summary>
        [HttpPost("link")]
        [Authorize]
        public async Task<IActionResult> LinkBank([FromBody] LinkBankRequest request)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "Không tìm thấy người dùng" });

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Người dùng không tồn tại" });

            // Validate input
            if (string.IsNullOrWhiteSpace(request.SoTaiKhoan))
                return BadRequest(new { message = "Vui lòng nhập số tài khoản" });

            // Find or create "Ngân hàng" account type
            var bankAccountType = await _context.LoaiTaiKhoan
                .Where(l => l.User.Id == userId && l.Ten == "Ngân hàng" && l.IsDeleted == false)
                .FirstOrDefaultAsync();

            if (bankAccountType == null)
            {
                bankAccountType = new LoaiTaiKhoan
                {
                    Ten = "Ngân hàng",
                    User = user,
                    IsDeleted = false,
                };
                _context.LoaiTaiKhoan.Add(bankAccountType);
                await _context.SaveChangesAsync();
            }

            // Create the linked bank account
            double initialBalance = request.IsDemo ? 10_000_000 : 0;
            var newAccount = new TaiKhoan
            {
                TenTaiKhoan = $"{request.TenNganHang} - {request.SoTaiKhoan}",
                SoDu = initialBalance,
                LoaiTaiKhoan = bankAccountType,
                User = user
            };
            _context.TaiKhoan.Add(newAccount);
            await _context.SaveChangesAsync();

            // In demo mode: seed realistic sample transactions
            if (request.IsDemo)
            {
                await SeedDemoTransactions(newAccount, user);
            }

            await _notificationService.SendTransactionChangedNotificationAsync(userId);

            return Ok(new
            {
                code = 200,
                message = request.IsDemo
                    ? $"Liên kết thành công! Tài khoản demo với 10.000.000 ₫ và dữ liệu mẫu đã được tạo."
                    : $"Liên kết {request.TenNganHang} thành công!",
                data = new
                {
                    id = newAccount.Id,
                    tenTaiKhoan = newAccount.TenTaiKhoan,
                    soDu = newAccount.SoDu,
                    isDemo = request.IsDemo
                }
            });
        }

        private async Task SeedDemoTransactions(TaiKhoan account, User user)
        {
            // 1. Lấy TẤT CẢ Thể loại Thu/Chi (Luôn né ID = 15)
            var theLoaiThuList = await _context.TheLoai
                .Where(t => t.PhanLoai == "Thu" && t.Id != 15)
                .ToListAsync();

            var theLoaiChiList = await _context.TheLoai
                .Where(t => t.PhanLoai == "Chi" && t.Id != 15)
                .ToListAsync();

            // Nếu không có data Thể loại thì dừng chạy
            if (!theLoaiThuList.Any() || !theLoaiChiList.Any()) return;

            var random = new Random();

            // SỬA LỖI POSTGRESQL Ở ĐÂY: Bắt buộc dùng UtcNow
            var today = DateTime.UtcNow;

            // 2. Danh sách base (Không cần fix cứng daysAgo nữa)
            var demoData = new List<(string ten, double soTien, string loai)>
            {
                ("Lương tháng này", 8_500_000, "Thu"),
                ("Grab Food - Bữa trưa", -85_000, "Chi"),
                ("VinMart - Mua sắm", -320_000, "Chi"),
                ("Thanh toán điện nước", -450_000, "Chi"),
                ("Shopee - Mua online", -230_000, "Chi"),
                ("Cà phê Highlands", -65_000, "Chi"),
                ("Phúc Long - Trà sữa", -55_000, "Chi"),
                ("Thu nhập freelance", 2_000_000, "Thu"),
                ("Xăng xe", -150_000, "Chi"),
                ("Ăn tối gia đình", -180_000, "Chi"),
                ("Chuyển khoản trả nợ", -500_000, "Chi"),
                ("Đăng ký Netflix", -260_000, "Chi")
            };

            // 3. Random ngày tháng và sắp xếp theo thời gian tăng dần
            var demoTransactions = demoData.Select(d => new
            {
                Ten = d.ten,
                SoTien = d.soTien,
                Loai = d.loai,
                // Random lùi về từ 0 đến 30 ngày trước, random thêm Giờ và Phút cho nó chân thực
                NgayGD = today.AddDays(-random.Next(0, 31))
                              .AddHours(-random.Next(0, 24))
                              .AddMinutes(-random.Next(0, 60))
            })
            .OrderBy(x => x.NgayGD) // BẮT BUỘC SẮP XẾP: Để cộng dồn số dư hợp lý theo dòng thời gian
            .ToList();

            double runningBalance = account.SoDu;

            // 4. Nhồi vào DB
            foreach (var item in demoTransactions)
            {
                // Random bốc 1 cái Thể loại trong List cho đa dạng (nhưng vẫn chắc chắn không dính ID 15)
                var theLoai = item.Loai == "Thu"
                    ? theLoaiThuList[random.Next(theLoaiThuList.Count)]
                    : theLoaiChiList[random.Next(theLoaiChiList.Count)];

                runningBalance += item.SoTien;

                var giaoDich = new GiaoDich
                {
                    TenGiaoDich = item.Ten,
                    NgayGiaoDich = item.NgayGD,
                    TaiKhoanGoc = account,
                    TaiKhoanPhu = null, // Vì đã né ID 15 (Chuyển khoản) nên cái này để null là chuẩn
                    TheLoai = theLoai,
                    TongTien = Math.Abs(item.SoTien),
                    GhiChu = "Giao dịch demo tự động"
                };
                _context.GiaoDich.Add(giaoDich);
            }

            // 5. Cập nhật số dư cuối cùng
            account.SoDu = runningBalance;
            await _context.SaveChangesAsync();
        }
    }

    public class LinkBankRequest
    {
        public string TenNganHang { get; set; } = string.Empty;
        public string SoTaiKhoan { get; set; } = string.Empty;
        public bool IsDemo { get; set; } = true;
    }
}