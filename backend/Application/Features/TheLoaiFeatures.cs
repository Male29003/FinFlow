using Application.Interface;
using Application.Response;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Application.Helpers;

namespace Application.Features.TheLoaiFeatures;
public class TheLoaiFeatures { 

    // Queries

    public class GetOne : BaseQuery<TheLoai, GetOne>
    {
        public int Id { get; set; }
        public class Handler : BaseHandler<GetOne>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;
            public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
            }

            public async override Task<TheLoai> Handle(GetOne query, CancellationToken cancellationToken)
            {
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }

                var theLoai = await _context.TheLoai
                                        .Where(a => !a.IsDeleted)
                                        .Where(a => a.Id == query.Id)
                                        .Where(a => a.User == null || a.User.Id == int.Parse(userIdClaim))
                                        .FirstOrDefaultAsync();
                return theLoai;
            }
        }
    }

    public class GetAll : BaseQuery<IEnumerable<TheLoai>, GetAll>
    {
        public class Handler : BaseHandler<GetAll>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;
            public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
            }

            public async override Task<IEnumerable<TheLoai>> Handle(GetAll query, CancellationToken cancellationToken)
            {
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }

                var TheLoaiList = await _context.TheLoai
                    .Where(t => !t.IsDeleted)
                    .Where(a => a.User == null || a.User.Id == int.Parse(userIdClaim))
                    .ToListAsync();
                if (TheLoaiList != null)
                    return TheLoaiList.AsReadOnly();
                return null;
            }
        }
    }

    // Commands
    public class Create : BaseFeature
    {
        public int UserId { get; set; }
        public String TenTheLoai { get; set; }
        public String? MoTa { get; set; }
        public String PhanLoai { get; set; }

        public class Handler : BaseHandler<Create>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;
            public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
            }

            public async override Task<IResponse> Handle(Create command, CancellationToken cancellationToken)
            {
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }
                // ktra xem theloai mới có bị trùng với hệ thống kok
                var normalizedInput = StringHelper.NormalizeName(command.TenTheLoai);

                // In Create.Handler.Handle, fix the LINQ query to close the parentheses for the Where clause before calling Select
                var existingCategories = await _context.TheLoai
                    .Where(x => !x.IsDeleted && (x.User == null || x.UserId == int.Parse(userIdClaim)))
                    .Select(x => new { x.TenTheLoai, x.PhanLoai })
                    .ToListAsync(cancellationToken);

                bool isDuplicate = existingCategories.Any(x =>
                    StringHelper.NormalizeName(x.TenTheLoai) == normalizedInput &&
                    x.PhanLoai == command.PhanLoai);

                if (isDuplicate)
                {
                    return new BadRequestResponse("Tên danh mục này đã tồn tại (hoặc trùng với hệ thống)!");
                }
                var theLoai = new TheLoai
                {
                    TenTheLoai = command.TenTheLoai,
                    MoTa = command.MoTa,
                    PhanLoai = command.PhanLoai,
                    UserId = int.Parse(userIdClaim)
                };
                // Kiểm tra validation của đối tượng theLoai
                var validationContext = new ValidationContext(theLoai, serviceProvider: null, items: null);
                var validationResults = new List<ValidationResult>();
                bool isValid = Validator.TryValidateObject(theLoai, validationContext, validationResults, validateAllProperties: true);

                // Nếu có lỗi validation, trả về thông báo lỗi
                if (!isValid)
                {
                    var errorMessages = string.Join("\n", validationResults.Select(vr => vr.ErrorMessage));
                    // Trả về tất cả các lỗi validation dưới dạng Response
                    return new ValidationFailResponse(errorMessages);
                }

                _context.TheLoai.Add(theLoai);
                await _context.SaveChangesAsync();
                return new CreatedResponse(theLoai.Id);
            }
        }
    }
    public class Update : BaseFeature
    {
        public int Id { get; set; }
        public String TenTheLoai { get; set; }
        public String? MoTa { get; set; }
        public String PhanLoai { get; set; }

        public class Handler : BaseHandler<Update>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;
            public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
            }
            public async override Task<IResponse> Handle(Update command, CancellationToken cancellationToken)
            {
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }

                // ktra trùng lặp
                var normalizedInput = StringHelper.NormalizeName(command.TenTheLoai);

                var existingCategories = await _context.TheLoai
                    .Where(x => !x.IsDeleted &&
                                x.Id != command.Id && 
                                (x.User == null || x.UserId == int.Parse(userIdClaim)))
                    .Select(x => new { x.TenTheLoai, x.PhanLoai })
                    .ToListAsync(cancellationToken);

                bool isDuplicate = existingCategories.Any(x =>
                    StringHelper.NormalizeName(x.TenTheLoai) == normalizedInput &&
                    x.PhanLoai == command.PhanLoai);

                if (isDuplicate)
                {
                    return new BadRequestResponse("Tên danh mục này đã bị trùng với một danh mục khác!");
                }

                var theLoai = _context.TheLoai.Where(x => x.Id == command.Id).FirstOrDefault();

                if (theLoai == null || theLoai.IsDeleted)
                    return new NotFoundResponse("Không tìm thấy thể loại cần cập nhật");

                if (theLoai.User == null)
                    return new BadRequestResponse("Không thể chỉnh sửa thể loại mặc định của hệ thống.");

                if (theLoai.User.Id != int.Parse(userIdClaim))
                    return new NotFoundResponse("Không tìm thấy thể loại của user cần cập nhật");

                else
                {
                    // Lưu lại giá trị cũ của PhanLoai để so sánh sau
                    var phanLoaiCu = theLoai.PhanLoai;

                    theLoai.TenTheLoai = command.TenTheLoai;
                    theLoai.MoTa = command.MoTa;
                    theLoai.PhanLoai = command.PhanLoai;

                    // Kiểm tra validation của đối tượng theLoai
                    var validationContext = new ValidationContext(theLoai, serviceProvider: null, items: null);
                    var validationResults = new List<ValidationResult>();
                    bool isValid = Validator.TryValidateObject(theLoai, validationContext, validationResults, validateAllProperties: true);

                    // Nếu có lỗi validation, trả về thông báo lỗi
                    if (!isValid)
                    {
                        var errorMessages = string.Join("\n", validationResults.Select(vr => vr.ErrorMessage));
                        // Trả về tất cả các lỗi validation dưới dạng Response
                        return new ValidationFailResponse(errorMessages);
                    }

                    //nếu phân loại thay đổi từ thu sang chi thì thay đổi số tiền trong tài khoản của các tài khoản liên quan đến thể loại này
                    // Kiểm tra xem phân loại có thay đổi không
                    if (phanLoaiCu != command.PhanLoai)
                    {
                        // Lấy các giao dịch có liên quan đến thể loại này
                        var giaoDichs = _context.GiaoDich.Where(x => x.TheLoai.Id == command.Id).ToList();

                        // Duyệt qua tất cả các giao dịch để điều chỉnh số dư của tài khoản
                        foreach (var giaoDich in giaoDichs)
                        {
                            // Lấy các tài khoản liên quan đến giao dịch (tài khoản chuyển và tài khoản nhận)
                            var taiKhoanGoc = giaoDich.TaiKhoanGoc;
                            var taiKhoanPhu = giaoDich.TaiKhoanPhu;

                            double soTien = giaoDich.TongTien*2; // vì nếu đổi từ thu sang chi thì số tiền sẽ thay đổi 2 lần

                            // Điều chỉnh số tiền dựa trên phân loại (Thu/Chi)
                            if (phanLoaiCu == "Thu" && command.PhanLoai == "Chi") // Nếu từ Thu chuyển sang Chi
                            {
                                soTien = -soTien; // Trừ số tiền trong tài khoản
                            }
                            else if (phanLoaiCu == "Chi" && command.PhanLoai == "Thu") // Nếu từ Chi chuyển sang Thu
                            {
                                soTien = soTien; // Cộng số tiền vào tài khoản
                            }

                            // Kiểm tra số lượng tài khoản tham gia
                            if (taiKhoanGoc != null)
                            {
                                taiKhoanGoc.CapNhatSoDu(-soTien); // Trừ tiền x2 từ tài khoản chuyển
                            }

                            if (taiKhoanPhu != null)
                            {
                                taiKhoanPhu.CapNhatSoDu(soTien); // Cộng tiền x2 vào tài khoản nhận
                            }
                        }

                    }

                    await _context.SaveChangesAsync();
                    return new SuccessResponse(theLoai.Id);
                }
            }
        }
    }

    public class Delete : BaseFeature
    {
        public int Id { get; set; }
        public class Handler : BaseHandler<Delete>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;
            public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
            }
            public async override Task<IResponse> Handle(Delete request, CancellationToken cancellationToken)
            {
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }

                var theLoai = _context.TheLoai.Where(x => x.Id == request.Id).FirstOrDefault();

                if (theLoai == null || theLoai.IsDeleted)
                    return new NotFoundResponse("Không tìm thấy thể loại cần xóa!");

                if (theLoai.User == null)
                    return new BadRequestResponse("Không thể xoá thể loại mặc định của hệ thống!");

                if (theLoai.User.Id != int.Parse(userIdClaim))
                    return new NotFoundResponse("Không tìm thấy thể loại của user cần xóa!");

                theLoai.IsDeleted = true;
                await _context.SaveChangesAsync();
                return new SuccessResponse(theLoai.Id);
            }
        }
    }
}

public static class TheLoaiHelper
{
    // Hàm này sẽ lột sạch Emoji, ký tự đặc biệt và khoảng trắng, ép về chữ thường
    // VD: "🍣 Ăn Uống " -> "ăn uống"
    public static string NormalizeName(string input)
    {
        if (string.IsNullOrEmpty(input)) return "";

        // Loại bỏ các ký tự là Emoji hoặc Symbol
        var noEmoji = Regex.Replace(input, @"\p{Cs}|\p{So}|\p{C}", "");

        return noEmoji.Trim().ToLower();
    }
}