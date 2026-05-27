using Application.Helpers;
using Application.Interface;
using Application.Response;
using Domain.DTO;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.LoaiTaiKhoanFeatures;

public class LoaiTaiKhoanFeatures
{
    // Commands
    public class Create : BaseFeature
    {
        public string Ten { get; set; }
        public class Handler : BaseHandler<Create>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;
            public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context) {
                _httpContextAccessor = httpContextAccessor;
            }

            public async override Task<IResponse> Handle(Create request, CancellationToken cancellationToken)
            {
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;

                // Kiểm tra nếu UserId không có trong claim
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }
                // ktra trùng lặp loại tài khoản
                var normalizedInput = StringHelper.NormalizeName(request.Ten);

                var existingAccounts = await _context.LoaiTaiKhoan
                    .Where(x => !x.IsDeleted && (x.User == null || x.User.Id == int.Parse(userIdClaim)))
                    .Select(x => x.Ten)
                    .ToListAsync(cancellationToken);

                bool isDuplicate = existingAccounts.Any(x => StringHelper.NormalizeName(x) == normalizedInput);

                if (isDuplicate)
                {
                    return new BadRequestResponse("Loại tài khoản này đã tồn tại!");
                }

                var loaiTaiKhoan = new LoaiTaiKhoan
                {
                    Ten = request.Ten,
                    User = _context.Users.Where(x => x.Id == int.Parse(userIdClaim)).FirstOrDefault(),
                    IsDeleted = false
                };

                // Kiểm tra validation của đối tượng loaiTaiKhoan
                var validationContext = new ValidationContext(loaiTaiKhoan, serviceProvider: null, items: null);
                var validationResults = new List<ValidationResult>();
                bool isValid = Validator.TryValidateObject(loaiTaiKhoan, validationContext, validationResults, validateAllProperties: true);

                // Nếu có lỗi validation, trả về thông báo lỗi
                if (!isValid)
                {
                    var errorMessages = string.Join("\n", validationResults.Select(vr => vr.ErrorMessage));
                    // Trả về tất cả các lỗi validation dưới dạng Response
                    return new ValidationFailResponse(errorMessages);
                }

                _context.LoaiTaiKhoan.Add(loaiTaiKhoan);
                await _context.SaveChangesAsync();
                return new SuccessResponse(loaiTaiKhoan.Id);
            }
        }
    }
    public class Update : BaseFeature
    {
        public int Id { get; set; }
        public string Ten { get; set; }
        public class Handler : BaseHandler<Update>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;
            public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
            }
            public async override Task<IResponse> Handle(Update request, CancellationToken cancellationToken)
            {
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;

                if(string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }
                // ktra trùng lặp loại tk
                var normalizedInput = StringHelper.NormalizeName(request.Ten);

                var existingAccounts = await _context.LoaiTaiKhoan
                    .Where(x => !x.IsDeleted &&
                                x.Id != request.Id && // Bỏ qua thằng đang sửa
                                (x.User == null || x.User.Id == int.Parse(userIdClaim)))
                    .Select(x => x.Ten)
                    .ToListAsync(cancellationToken);

                bool isDuplicate = existingAccounts.Any(x => StringHelper.NormalizeName(x) == normalizedInput);

                if (isDuplicate)
                {
                    return new BadRequestResponse("Tên loại tài khoản này đã bị trùng!");
                }

                var loaiTaiKhoan = _context.LoaiTaiKhoan.Where(x => x.Id == request.Id).FirstOrDefault();
                if (loaiTaiKhoan == null || loaiTaiKhoan.IsDeleted)
                    return new NotFoundResponse("Không tìm thấy loại tài khoản cần cập nhật");

                if (loaiTaiKhoan.User == null)
                    return new BadRequestResponse("Không thể chỉnh sửa loại tài khoản mặc định của hệ thống.");

                if (loaiTaiKhoan.User.Id != int.Parse(userIdClaim))
                    return new NotFoundResponse("Không tìm thấy loại tài khoản của user cần cập nhật");

                else
                {
                    loaiTaiKhoan.Ten = request.Ten;

                    // Kiểm tra validation của đối tượng loaiTaiKhoan
                    var validationContext = new ValidationContext(loaiTaiKhoan, serviceProvider: null, items: null);
                    var validationResults = new List<ValidationResult>();
                    bool isValid = Validator.TryValidateObject(loaiTaiKhoan, validationContext, validationResults, validateAllProperties: true);

                    // Nếu có lỗi validation, trả về thông báo lỗi
                    if (!isValid)
                    {
                        var errorMessages = string.Join("\n", validationResults.Select(vr => vr.ErrorMessage));
                        // Trả về tất cả các lỗi validation dưới dạng Response
                        return new ValidationFailResponse(errorMessages);
                    }

                    await _context.SaveChangesAsync();
                    return new SuccessResponse(loaiTaiKhoan.Id);
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

                var loaiTaiKhoan = _context.LoaiTaiKhoan.Where(x => x.Id == request.Id).FirstOrDefault();

                if (loaiTaiKhoan == null || loaiTaiKhoan.IsDeleted)
                    return new NotFoundResponse("Không tìm thấy loại tài khoản cần xóa");

                if (loaiTaiKhoan.User == null)
                    return new BadRequestResponse("Không thể xóa loại tài khoản mặc định của hệ thống.");

                if (loaiTaiKhoan.User.Id != int.Parse(userIdClaim))
                    return new NotFoundResponse("Không tìm thấy loại tài khoản của user cần xóa");

                loaiTaiKhoan.IsDeleted = true;
                await _context.SaveChangesAsync();
                return new SuccessResponse(loaiTaiKhoan.Id);
            }
        }
    }

    // Queries
    public class GetOne : BaseQuery<LoaiTaiKhoanDTO, GetOne>
    {
        public int Id { get; set; }
        public class Handler : BaseHandler<GetOne>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;
            public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
            }

            public async override Task<LoaiTaiKhoanDTO> Handle(GetOne query, CancellationToken cancellationToken)
            {
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;

                if(string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }

                var loaiTaiKhoanDTO = await _context.LoaiTaiKhoan
                    .Where(a=> !a.IsDeleted)
                    .Where(a => a.Id == query.Id)
                    .Where(a => a.User == null || a.User.Id == int.Parse(userIdClaim))
                    .Select(a => new LoaiTaiKhoanDTO(a.Id, a.Ten, a.User.Id))
                    .FirstOrDefaultAsync();

                if (loaiTaiKhoanDTO != null)
                    return loaiTaiKhoanDTO;
                return null;
            }
        }
    }

    public class GetAll : BaseQuery<PagedResult<LoaiTaiKhoanDTO>, GetAll>
    {
        public int Page { get; set; }
        public int Size { get; set; }
        public string? Keyword { get; set; }
        public class Handler : BaseHandler<GetAll>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;
            public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
            }
            public async override Task<PagedResult<LoaiTaiKhoanDTO>> Handle(GetAll query, CancellationToken cancellationToken)
            {
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }

                var queryable = _context.LoaiTaiKhoan
                    .Where(ltk => !ltk.IsDeleted)
                    .Where(ltk => ltk.User == null || ltk.User.Id == int.Parse(userIdClaim));
                    
                if (!string.IsNullOrEmpty(query.Keyword))
                {
                    queryable = queryable.Where(t => t.Ten.Contains(query.Keyword));
                }
                var totalCount = await queryable.CountAsync(cancellationToken);

                var loaiTaiKhoanList = await queryable
               .Skip((query.Page - 1) * query.Size) // Bỏ qua các bản ghi trước đó
               .Take(query.Size) // Lấy số lượng bản ghi theo `Size`
               .Select(t => new LoaiTaiKhoanDTO
               {
                   id = t.Id,
                   ten = t.Ten,
               })
               .ToListAsync(cancellationToken);
                return new PagedResult<LoaiTaiKhoanDTO>
                {
                    Data = loaiTaiKhoanList,
                    TotalCount = totalCount,
                    PageSize = query.Size,
                    CurrentPage = query.Page,
                    Keyword = query.Keyword
                };
            }
        }
    }

}