using Application.Interface;
using Application.Response;
using Domain.DTO;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.GiaoDichFeatures;

// Commands

public class GiaoDichFeatures
{
    public class Create : BaseFeature
    {
        public String TenGiaoDich { get; set; }
        public DateTime NgayGiaoDich { get; set; }
        //public String LoaiGiaoDich { get; set; }
        //public Collection<int> TaiKhoan { get; set; }

        public int TaiKhoanGocId { get; set; }
        public int? TaiKhoanPhuId { get; set; }
        public int TheLoaiId { get; set; }
        public Double TongTien { get; set; }
        public String? GhiChu { get; set; }
        

        public class Handler : BaseHandler<Create>
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
            public async override Task<IResponse> Handle(Create command, CancellationToken cancellationToken)
            {
                //if (command.TaiKhoan.Count == 0 || command.TaiKhoan.Count > 2)
                //{
                //    return new BadRequestResponse("Số lượng tài khoản tối thiểu là 1, tối đa là 2");
                //}
                //var TaiKhoanGiaoDich = _context.TaiKhoan.Where(x => command.TaiKhoan.Contains(x.Id)).ToList();
                var taiKhoanGoc = _context.TaiKhoan.Where(x => x.Id == command.TaiKhoanGocId).FirstOrDefault();
                var taiKhoanPhu = _context.TaiKhoan.Where(x => x.Id == command.TaiKhoanPhuId).FirstOrDefault();
                //if (TaiKhoanGiaoDich.Count == 0)
                //{
                //    return new NotFoundResponse("Không tìm thấy tài khoản");
                //}
                if (taiKhoanGoc == null && taiKhoanPhu == null)
                {
                    return new NotFoundResponse("Không tìm thấy tài khoản");
                }
                if(taiKhoanGoc == null)
                {
                    return new NotFoundResponse("Không tìm thấy tài khoản gốc");
                }

                var TheLoai = _context.TheLoai.Where(x => x.Id == command.TheLoaiId).FirstOrDefault();
                if (TheLoai == null)
                {
                    return new NotFoundResponse(". Thể loại: " + command.TheLoaiId + 
                        "Thể loại không tồn tại");
                }
                //var ChiTietGiaoDich = new ChiTietGiaoDich
                //{
                //    TaiKhoanGiaoDich = TaiKhoanGiaoDich,
                //    TheLoai = TheLoai,
                //};
                var GiaoDich = new GiaoDich
                {
                    TenGiaoDich = command.TenGiaoDich,
                    NgayGiaoDich = command.NgayGiaoDich,
                    TaiKhoanGoc = taiKhoanGoc,
                    TaiKhoanPhu = taiKhoanPhu,
                    TheLoai = TheLoai,
                    //LoaiGiaoDich = command.LoaiGiaoDich,
                    //ChiTietGiaoDich = ChiTietGiaoDich,
                    TongTien = command.TongTien,
                    GhiChu = command.GhiChu
                };

                // Kiểm tra validation của đối tượng GiaoDich
                var validationContext = new ValidationContext(GiaoDich, serviceProvider: null, items: null);
                var validationResults = new List<ValidationResult>();
                bool isValid = Validator.TryValidateObject(GiaoDich, validationContext, validationResults, validateAllProperties: true);

                // Nếu có lỗi validation, trả về thông báo lỗi
                if (!isValid)
                {
                    var errorMessages = string.Join("\n", validationResults.Select(vr => vr.ErrorMessage));
                    // Trả về tất cả các lỗi validation dưới dạng Response
                    return new ValidationFailResponse(errorMessages);
                }

                if (taiKhoanPhu == null)
                {
                    if (TheLoai?.PhanLoai == "Thu") // dành cho giao dịch nếu dùng 1 tài khoản
                    {
                        taiKhoanGoc.CapNhatSoDu(command.TongTien); // nếu cộng thêm tiền thì điền số dương
                    }
                    else
                    {
                        taiKhoanGoc.CapNhatSoDu(-command.TongTien); // nếu trừ tiền thì điền số âm
                    }
                }
                else //-----------------------------------------------chổ này cần xử lý lại cho giao dịch nếu dùng 2 tài khoản-----------------------------------//
                {
					// Kiểm tra tài khoản chuyển có đủ tiền không 
					if (taiKhoanGoc.SoDu < command.TongTien)
					{
						return new BadRequestResponse("Số dư tài khoản gốc không đủ.");
					}
                    try { 
					    taiKhoanGoc.CapNhatSoDu(-command.TongTien); //trừ tiền tài khoản chuyển
                        taiKhoanPhu.CapNhatSoDu(command.TongTien); // cộng tiền tài khoản nhận
                    }
                    catch (Exception ex) {
                        // Nếu xảy ra lỗi ==> rollback, cập nhật lại số dư tk
						taiKhoanGoc.CapNhatSoDu(command.TongTien);
						taiKhoanPhu.CapNhatSoDu(-command.TongTien); 
                        return new BadRequestResponse(ex.Message);
					}
				}
                //foreach (var item in TaiKhoanGiaoDich) // kiểm tra lại sau khi giao dịch có tài khoản nào bị âm số dư không
                //{
                //    if(item.SoDu < 0 && GiaoDich.LoaiGiaoDich=="CK") // nếu số dư âm và loại giao dịch là chuyển khoản thì trả lại số dư
                //    {
                //        return new BadRequestResponse("Số dư tài khoản không đủ để thực hiện giao dịch chuyển khoản");
                //    };
                //}
                _context.GiaoDich.Add(GiaoDich);
                await _context.SaveChangesAsync();

                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value;
                if (!string.IsNullOrEmpty(userIdClaim))
                {
                    int userId = int.Parse(userIdClaim);
                    await _notificationService.SendTransactionChangedNotificationAsync(userId);
                }
                return new SuccessResponse($"Thêm giao dịch mới thành công với mã giao dịch:{GiaoDich.Id} ");
            }
        }
    }
    public class Update : BaseFeature
    {
        public int Id { get; set; }
        public String TenGiaoDich { get; set; }
        public DateTime NgayGiaoDich { get; set; }
        //public Collection<int> TaiKhoan { get; set; }
        public int TaiKhoanGocId { get; set; }
        public int? TaiKhoanPhuId { get; set; }
        public int TheLoaiId { get; set; }
        public Double TongTien { get; set; }
        public String? GhiChu { get; set; }

        public class Handler : BaseHandler<Update>
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
            public void handleRefund(TaiKhoan goc, TaiKhoan? phu, Double soTien)
            {
                goc.CapNhatSoDu(soTien);
                if(phu != null)
                {
                    phu.CapNhatSoDu(-soTien);
                }
            }
            public async override Task<IResponse> Handle(Update command, CancellationToken cancellationToken)
            {
                //if (command.TaiKhoan.Count == 0 || command.TaiKhoan.Count > 2)
                //{
                //    return new BadRequestResponse("Số lượng tài khoản tối thiểu là 1, tối đa là 2");
                //}
                var taiKhoanGoc = _context.TaiKhoan.Where(x => x.Id == command.TaiKhoanGocId).FirstOrDefault();
                var taiKhoanPhu = _context.TaiKhoan.Where(x => x.Id == command.TaiKhoanPhuId).FirstOrDefault();
                //if (TaiKhoanGiaoDich.Count == 0)
                //{
                //    return new NotFoundResponse("Không tìm thấy tài khoản");
                //}
                if (taiKhoanGoc == null && taiKhoanPhu == null)
                {
                    return new NotFoundResponse("Không tìm thấy tài khoản");
                }
                if (taiKhoanGoc == null)
                {
                    return new NotFoundResponse("Không tìm thấy tài khoản gốc");
                }

                var TheLoai = _context.TheLoai.Where(x => x.Id == command.TheLoaiId).FirstOrDefault();
                if (TheLoai == null)
                {
                    return new NotFoundResponse("Thể loại không tồn tại");
                }
                

                //var ChiTietGiaoDich = new ChiTietGiaoDich
                //{
                //    TaiKhoanGiaoDich = TaiKhoanGiaoDich,
                //    TheLoai = TheLoai,
                //};
                var GiaoDich = _context.GiaoDich.Where(x => x.Id == command.Id).FirstOrDefault();
                if (GiaoDich == null)
                {
                    return new NotFoundResponse("Không tìm thấy giao dịch");
                }
                else
                {
                    bool checkNotChanges =
                                GiaoDich.TenGiaoDich == command.TenGiaoDich &&
                                GiaoDich.NgayGiaoDich == command.NgayGiaoDich &&
                                GiaoDich.TaiKhoanGoc.Id == taiKhoanGoc.Id &&
                                GiaoDich.TaiKhoanPhu?.Id == taiKhoanPhu?.Id &&
                                GiaoDich.TheLoai.Id == command.TheLoaiId &&
                                GiaoDich.GhiChu == command.GhiChu &&
                                GiaoDich.TongTien == command.TongTien;
                    if (checkNotChanges)
                    {
						return new BadRequestResponse($"Giao dịch mang ID {GiaoDich.Id} không thay đổi");
					}

					// Kiểm tra tài khoản có thay đổi không
					bool taiKhoanThayDoi = GiaoDich.TaiKhoanGoc.Id != taiKhoanGoc.Id ||
						GiaoDich.TaiKhoanPhu?.Id != taiKhoanPhu?.Id;

					/*====================================================================================== Xử lý HOÀN TIỀN ======================================================================================*/
					// TH giao dịch cũ là GD giữa 2 tk
					if (GiaoDich.TaiKhoanPhu != null)
                    {
                        if(GiaoDich.TaiKhoanPhu?.SoDu < GiaoDich.TongTien)
							return new BadRequestResponse($"Không thể cập nhật giao dịch ${GiaoDich.Id} do số dư tài khoản phụ không đủ để hoàn trả tài khoản gốc từ giao dịch ban đầu !!!");

						// Nếu hợp lệ ==> Tiến hành hoàn tiền
						GiaoDich.TaiKhoanGoc.CapNhatSoDu(GiaoDich.TongTien);
                        GiaoDich.TaiKhoanPhu.CapNhatSoDu(-GiaoDich.TongTien);
					}
                    else // TH còn lại ==> Hoàn tiền bình thường
                    {
                        if (GiaoDich.TheLoai.PhanLoai == "Thu")
                        {
                            // Hoàn tiền bth
                            GiaoDich.TaiKhoanGoc.CapNhatSoDu(-GiaoDich.TongTien);
                        }
                        else // GD chi ==> Hoàn tiền tk gốc
                            GiaoDich.TaiKhoanGoc.CapNhatSoDu(GiaoDich.TongTien);
					}
					/*====================================================================================== Xử lý CẬP NHẬT GD MỚI ======================================================================================*/
					// Hệ số tính số tiền mới
					int heSo = TheLoai.PhanLoai == "Thu" ? 1 : -1;
					
                    // Kiểm tra giao dịch mới:
					// TH1: TK đổi ==> tiến hành thay đổi
					// TH2: TK ko đổi, TongTien đổi => hoàn tiền và tính TongTien mới
					if (taiKhoanThayDoi || command.TongTien != GiaoDich.TongTien || command.TheLoaiId != GiaoDich.TheLoai.Id)
				    {
					    // Nếu có tài khoản phụ ==> giao dịch giữa 2 tk mới
					    if (taiKhoanPhu != null)
					    {
						    if (taiKhoanGoc.SoDu < GiaoDich.TongTien)
							    return new BadRequestResponse($"Không thể cập nhật giao dịch ${GiaoDich.Id} do số dư tài khoản gốc không đủ để chuyển tiền sang tài khoản phụ !!!");

						    taiKhoanGoc.CapNhatSoDu(command.TongTien * heSo);
						    taiKhoanPhu.CapNhatSoDu(-command.TongTien * heSo);
					    }
                        // Các TH khác ==> Cập nhật số dư tài khoản gốc bth
                        else
                        {
                            // Còn lại ==> cập nhật bth
							taiKhoanGoc.CapNhatSoDu(command.TongTien * heSo);

                        }
				    }

					GiaoDich.TenGiaoDich = command.TenGiaoDich;
                    GiaoDich.NgayGiaoDich = command.NgayGiaoDich;
                    GiaoDich.TaiKhoanGoc = taiKhoanGoc;
                    GiaoDich.TaiKhoanPhu = taiKhoanPhu;
                    GiaoDich.TheLoai = TheLoai;
                    //GiaoDich.LoaiGiaoDich = command.LoaiGiaoDich;
                    //GiaoDich.ChiTietGiaoDich = ChiTietGiaoDich;
                    GiaoDich.TongTien = command.TongTien;
                    GiaoDich.GhiChu = command.GhiChu;

                    // Kiểm tra validation của đối tượng GiaoDich
                    var validationContext = new ValidationContext(GiaoDich, serviceProvider: null, items: null);
                    var validationResults = new List<ValidationResult>();
                    bool isValid = Validator.TryValidateObject(GiaoDich, validationContext, validationResults, validateAllProperties: true);

                    // Nếu có lỗi validation, trả về thông báo lỗi
                    if (!isValid)
                    {
                        var errorMessages = string.Join("\n", validationResults.Select(vr => vr.ErrorMessage));
                        // Trả về tất cả các lỗi validation dưới dạng Response
                        return new ValidationFailResponse(errorMessages);
                    }

                    await _context.SaveChangesAsync();

                    var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value;
                    if (!string.IsNullOrEmpty(userIdClaim))
                    {
                        int userId = int.Parse(userIdClaim);
                        await _notificationService.SendTransactionChangedNotificationAsync(userId);
                    }

                    return new SuccessResponse($"Cập nhật giao dịch thành công: {GiaoDich.Id}");
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
            private readonly ISignalRNotificationService _notificationService;
            public Handler(IApplicationDbContext context,
                           IHttpContextAccessor httpContextAccessor,
                           ISignalRNotificationService notificationService) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
                _notificationService = notificationService;
            }
            public async override Task<IResponse> Handle(Delete request, CancellationToken cancellationToken)
            {
                var GiaoDich = _context.GiaoDich.Where(x => x.Id == request.Id).FirstOrDefault();
                if (GiaoDich == null) return new NotFoundResponse("Không tìm thấy giao dịch");
                else
                {
                    //var taiKhoanGiaoDich = GiaoDich.ChiTietGiaoDich.TaiKhoanGiaoDich.ToList();
                    var taiKhoanGoc = GiaoDich.TaiKhoanGoc;
                    var taiKhoanPhu = GiaoDich.TaiKhoanPhu;
                    // Kiểm tra giao dịch đặc biệt
                    var heSo = GiaoDich.TheLoai.PhanLoai == "Thu" ? -1 : 1;

                    if(GiaoDich.TaiKhoanPhu != null)
                    {
                        if (taiKhoanPhu?.SoDu < GiaoDich.TongTien)
                            return new BadRequestResponse($"Không thể xóa giao dịch {GiaoDich.Id} do số dư tài khoản không đủ!!!");


                        taiKhoanGoc.CapNhatSoDu(GiaoDich.TongTien);     // Hoàn tiền cho tài khoản gốc
                        taiKhoanPhu?.CapNhatSoDu(-GiaoDich.TongTien);   // Trừ lại tài khoản phụ
                    }
                    else  // Normal single-account transaction
                    {
                        taiKhoanGoc.CapNhatSoDu(GiaoDich.TongTien * heSo);
                    }

                    GiaoDich.IsDeleted = true;
                    await _context.SaveChangesAsync();

                    var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value;
                    if (!string.IsNullOrEmpty(userIdClaim))
                    {
                        int userId = int.Parse(userIdClaim);
                        await _notificationService.SendTransactionChangedNotificationAsync(userId);
                    }
                    return new SuccessResponse($"Xóa giao dịch thành công, mã giao dịch: {GiaoDich.Id}");
                }
            }
        }
    }

    // Queries
    public class GetOne : BaseQuery<GiaoDichDTO, GetOne>
    {
        public int Id { get; set; }

        public class Handler : BaseHandler<GetOne>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;

            public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
            }

            public async override Task<GiaoDichDTO> Handle(GetOne query, CancellationToken cancellationToken)
            {
                // Lấy UserId từ claim
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;

                // Kiểm tra nếu UserId không có trong claim
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }

                // Tìm giao dịch theo Id và UserId
                return await _context.GiaoDich
                    .Where(x => !x.IsDeleted && x.Id == query.Id && 
                                (x.TaiKhoanGoc.User.Id == int.Parse(userIdClaim) ||
                                 (x.TaiKhoanPhu != null && x.TaiKhoanPhu.User.Id == int.Parse(userIdClaim))))
                    .Select(gd => new GiaoDichDTO
                    {
                        id = gd.Id,
                        tenGiaoDich = gd.TenGiaoDich,
                        ngayGiaoDich = gd.NgayGiaoDich,
                        //LoaiGiaoDich = gd.LoaiGiaoDich,
                        taiKhoanGoc = new TaiKhoanDTO
                        {
                            id = gd.TaiKhoanGoc.Id,
                            tenTaiKhoan = gd.TaiKhoanGoc.TenTaiKhoan,
                            loaiTaiKhoanId = gd.TaiKhoanGoc.LoaiTaiKhoanId,
                            soDu = gd.TaiKhoanGoc.SoDu
                        },
                        taiKhoanPhu = gd.TaiKhoanPhu == null ? null : new TaiKhoanDTO
                        {
                            id = gd.TaiKhoanPhu.Id,
                            tenTaiKhoan = gd.TaiKhoanPhu.TenTaiKhoan,
                            loaiTaiKhoanId = gd.TaiKhoanPhu.LoaiTaiKhoanId,
                            soDu = gd.TaiKhoanPhu.SoDu
                        },
                        theLoai = new TheLoaiDTO
                        {
                            id = gd.TheLoai.Id,
                            tenTheLoai = gd.TheLoai.TenTheLoai,
                            moTa = gd.TheLoai.MoTa,
                            phanLoai = gd.TheLoai.PhanLoai
                        },
                        tongTien = gd.TongTien,
                        ghiChu = gd.GhiChu,
                    })
                    .FirstOrDefaultAsync(cancellationToken);
            }
        }
    }

    public class GetAll : BaseQuery<PagedResult<GiaoDichDTO>, GetAll>
    {
        public int Page { get; set; }
        public int Size { get; set; }
        public string? Keyword { get; set; }

        public int? MaTaiKhoan { get; set; }
        public string? PhanLoai { get; set; }

        public class Handler : BaseHandler<GetAll>
        {
            private readonly IHttpContextAccessor _httpContextAccessor;

            public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
            {
                _httpContextAccessor = httpContextAccessor;
            }

            public async override Task<PagedResult<GiaoDichDTO>> Handle(GetAll query, CancellationToken cancellationToken)
            {
                // Lấy UserId từ HttpContext
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;  // Trả về null nếu không có UserId
                }

                int userId = int.Parse(userIdClaim);

                // Tạo truy vấn lọc theo UserId
                var queryable = _context.GiaoDich
                    .Where(gd => !gd.IsDeleted &&
                        (gd.TaiKhoanGoc.User.Id == userId ||
                        (gd.TaiKhoanPhu != null && gd.TaiKhoanPhu.User.Id == userId)));

                // Lọc theo từ khóa nếu có
                if (!string.IsNullOrEmpty(query.Keyword))
                {
                    queryable = queryable.Where(gd => gd.TenGiaoDich.Contains(query.Keyword));
                }

                // Lọc theo tài khoản giao dịch nếu có
                if (query.MaTaiKhoan != null)
                {
                    queryable = queryable.Where(gd => gd.TaiKhoanGoc.Id == query.MaTaiKhoan || gd.TaiKhoanPhu.Id == query.MaTaiKhoan);
                }

                // Lọc theo phanLoai nếu có
                if(query.PhanLoai != null)
                {
                    queryable = queryable.Where(gd => gd.TheLoai.PhanLoai == query.PhanLoai);
                }

                // sắp xếp từ mới nhất tới cũ nhất
                queryable = queryable.OrderByDescending(a => a.NgayGiaoDich).ThenByDescending(a => a.Id);


                // Tính tổng số lượng bản ghi
                var totalCount = await queryable.CountAsync(cancellationToken);

                // Lấy danh sách giao dịch với phân trang
                var giaoDichList = await queryable
                    .Skip((query.Page - 1) * query.Size)
                    .Take(query.Size)
                    .Select(gd => new GiaoDichDTO
                    {
                        id = gd.Id,
                        tenGiaoDich = gd.TenGiaoDich,
                        ngayGiaoDich = gd.NgayGiaoDich,
                        //LoaiGiaoDich = gd.LoaiGiaoDich,
                        taiKhoanGoc = new TaiKhoanDTO
                        {
                            id = gd.TaiKhoanGoc.Id,
                            tenTaiKhoan = gd.TaiKhoanGoc.TenTaiKhoan,
                            loaiTaiKhoanId = gd.TaiKhoanGoc.LoaiTaiKhoanId,
                            soDu = gd.TaiKhoanGoc.SoDu
                        },
                        taiKhoanPhu = gd.TaiKhoanPhu == null ? null : new TaiKhoanDTO
                        {
                            id = gd.TaiKhoanPhu.Id,
                            tenTaiKhoan = gd.TaiKhoanPhu.TenTaiKhoan,
                            loaiTaiKhoanId = gd.TaiKhoanPhu.LoaiTaiKhoanId,
                            soDu = gd.TaiKhoanPhu.SoDu
                        },
                        theLoai = new TheLoaiDTO
                        {
                            id = gd.TheLoai.Id,
                            tenTheLoai = gd.TheLoai.TenTheLoai,
                            moTa = gd.TheLoai.MoTa,
                            phanLoai = gd.TheLoai.PhanLoai
                        },
                        tongTien = gd.TongTien,
                        ghiChu = gd.GhiChu,
                        //TaiKhoanGiaoDich = gd.ChiTietGiaoDich.TaiKhoanGiaoDich.Select(tk => new TaiKhoanDTO
                        //{
                        //    id = tk.Id,
                        //    tenTaiKhoan = tk.TenTaiKhoan,
                        //    loaiTaiKhoanId = tk.LoaiTaiKhoanId,
                        //    soDu = tk.SoDu
                        //}).ToList()
                    })
                    .ToListAsync(cancellationToken);

                // Trả về kết quả dạng phân trang
                return new PagedResult<GiaoDichDTO>
                {
                    Data = giaoDichList,
                    TotalCount = totalCount,
                    PageSize = query.Size,
                    CurrentPage = query.Page,
                    Keyword = query.Keyword
                };
            }
        }
    }

        public class GetByDateRange : BaseQuery<PagedResult<GiaoDichDTO>, GetByDateRange>
        {
            public int Page { get; set; }
            public int Size { get; set; }

            public DateTime? TuNgay { get; set; }

            public DateTime? DenNgay { get; set; }
            public class Handler : BaseHandler<GetByDateRange>
            {
                private readonly IHttpContextAccessor _httpContextAccessor;

                public Handler(IApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
                {
                    _httpContextAccessor = httpContextAccessor;
                }

                public async override Task<PagedResult<GiaoDichDTO>> Handle(GetByDateRange query, CancellationToken cancellationToken)
                {
                var emptyResult = new PagedResult<GiaoDichDTO>
                {
                    Data = new List<GiaoDichDTO>(),
                    TotalCount = 0,
                    PageSize = query.Size,
                    CurrentPage = query.Page
                };

                // Kiểm tra ngày tháng
                if (query.TuNgay.HasValue && query.DenNgay.HasValue && query.TuNgay > query.DenNgay)
                {
                    return emptyResult;
                }
                // Lấy UserId từ HttpContext
                var userIdClaim = _httpContextAccessor.HttpContext.User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return emptyResult;
                }

                int userId = int.Parse(userIdClaim);

                DateTime? tuNgayUtc = query.TuNgay?.ToUniversalTime();
                DateTime? denNgayUtc = query.DenNgay?.ToUniversalTime();

                // Tạo truy vấn lọc theo UserId
                var queryable = _context.GiaoDich
                    .Where(gd => !gd.IsDeleted &&
                        (gd.TaiKhoanGoc.User.Id == userId ||
                            (gd.TaiKhoanPhu != null && gd.TaiKhoanPhu.User.Id == userId)));

                if (tuNgayUtc.HasValue && denNgayUtc.HasValue)
                {
                    queryable = queryable.Where(a => a.NgayGiaoDich >= tuNgayUtc.Value && a.NgayGiaoDich <= denNgayUtc.Value);
                }

                queryable = queryable.OrderByDescending(a => a.NgayGiaoDich).ThenByDescending(a => a.Id);

                // Tính tổng số lượng bản ghi
                var totalCount = await queryable.CountAsync(cancellationToken);
                    // Lấy danh sách giao dịch với phân trang
                    var giaoDichList = await queryable
                        .Skip((query.Page - 1) * query.Size)
                        .Take(query.Size)
                        .Select(gd => new GiaoDichDTO
                        {
                            id = gd.Id,
                            tenGiaoDich = gd.TenGiaoDich,
                            ngayGiaoDich = gd.NgayGiaoDich,
                            //LoaiGiaoDich = gd.LoaiGiaoDich,
                            taiKhoanGoc = new TaiKhoanDTO
                            {
                                id = gd.TaiKhoanGoc.Id,
                                tenTaiKhoan = gd.TaiKhoanGoc.TenTaiKhoan,
                                loaiTaiKhoanId = gd.TaiKhoanGoc.LoaiTaiKhoanId,
                                soDu = gd.TaiKhoanGoc.SoDu
                            },
                            taiKhoanPhu = gd.TaiKhoanPhu == null ? null : new TaiKhoanDTO
                            {
                                id = gd.TaiKhoanPhu.Id,
                                tenTaiKhoan = gd.TaiKhoanPhu.TenTaiKhoan,
                                loaiTaiKhoanId = gd.TaiKhoanPhu.LoaiTaiKhoanId,
                                soDu = gd.TaiKhoanPhu.SoDu
                            },
                            theLoai = new TheLoaiDTO
                            {
                                id = gd.TheLoai.Id,
                                tenTheLoai = gd.TheLoai.TenTheLoai,
                                moTa = gd.TheLoai.MoTa,
                                phanLoai = gd.TheLoai.PhanLoai
                            },
                            tongTien = gd.TongTien,
                            ghiChu = gd.GhiChu,
                        })
                        .ToListAsync(cancellationToken);

                    // Trả về kết quả dạng phân trang
                    return new PagedResult<GiaoDichDTO>
                    {
                        Data = giaoDichList,
                        TotalCount = totalCount,
                        PageSize = query.Size,
                        CurrentPage = query.Page,
                    };
                }
            }
        }



}