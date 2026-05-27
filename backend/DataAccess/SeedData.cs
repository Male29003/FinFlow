using DataAccess.Configuration;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccess
{
    public static class SeedData
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // Only seed if tables are empty
            if (!await context.TheLoai.AnyAsync())
            {
                var theLoaiList = new List<TheLoai>
                {
                    // Chi (Expense categories)
                    new() { TenTheLoai = "🍽️Ăn uống",         MoTa = "Chi phí ăn uống",      PhanLoai = "Chi", User = null },
                    new() { TenTheLoai = "🛒Mua sắm",         MoTa = "Chi phí mua sắm",      PhanLoai = "Chi", User = null },
                    new() { TenTheLoai = "👖Đồ mặc",          MoTa = "Quần áo, giày dép",    PhanLoai = "Chi", User = null },
                    new() { TenTheLoai = "🏠Nhà cửa",         MoTa = "Tiền thuê, điện nước", PhanLoai = "Chi", User = null },
                    new() { TenTheLoai = "⛽Di chuyển",       MoTa = "Xăng xe, Grab, bus",   PhanLoai = "Chi", User = null },
                    new() { TenTheLoai = "💖Sức khỏe",        MoTa = "Thuốc, khám bệnh",     PhanLoai = "Chi", User = null },
                    new() { TenTheLoai = "🍿Giải trí",        MoTa = "Phim, game, du lịch",  PhanLoai = "Chi", User = null },
                    new() { TenTheLoai = "📚Giáo dục",        MoTa = "Học phí, sách vở",     PhanLoai = "Chi", User = null },
                    new() { TenTheLoai = "Khác (Chi)",      MoTa = "Chi phí khác",         PhanLoai = "Chi", User = null },

                    // Thu (Income categories)
                    new() { TenTheLoai = "💵Lương",           MoTa = "Lương tháng",          PhanLoai = "Thu", User = null },
                    new() { TenTheLoai = "💰Thưởng",          MoTa = "Thưởng, bonus",        PhanLoai = "Thu", User = null },
                    new() { TenTheLoai = "💻Freelance",       MoTa = "Thu nhập tự do",       PhanLoai = "Thu", User = null },
                    new() { TenTheLoai = "📈Đầu tư",          MoTa = "Lợi nhuận đầu tư",    PhanLoai = "Thu", User = null },
                    new() { TenTheLoai = "Khác (Thu)",      MoTa = "Thu nhập khác",        PhanLoai = "Thu", User = null },

                    // Special — used for 2-account transfers
                    new() { TenTheLoai = "🔁Giao dịch giữa 2 tài khoản", MoTa = "Chuyển tiền nội bộ", PhanLoai = "Chi", User = null },
                };
                await context.TheLoai.AddRangeAsync(theLoaiList);
            }

            if (!await context.LoaiTaiKhoan.AnyAsync(l => l.User == null))
            {
                var loaiTaiKhoanList = new List<LoaiTaiKhoan>
                {
                    new() { Ten = "Tiền mặt",   User = null, IsDeleted = false },
                    new() { Ten = "Ngân hàng",  User = null, IsDeleted = false },
                    new() { Ten = "Ví điện tử", User = null, IsDeleted = false },
                    new() { Ten = "Tiết kiệm",  User = null, IsDeleted = false },
                    new() { Ten = "Đầu tư",     User = null, IsDeleted = false },
                };
                await context.LoaiTaiKhoan.AddRangeAsync(loaiTaiKhoanList);
            }

            await context.SaveChangesAsync();
        }
    }
}