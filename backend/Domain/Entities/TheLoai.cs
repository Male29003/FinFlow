using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities;

[Table("TheLoai")]
public class TheLoai : BaseEntity 
{
    [Required(ErrorMessage = "Tên thể loại không được để trống.")]
    [RegularExpression(@"^(?!\s)(.*[^\s])?$", ErrorMessage = "Tên thể loại không được có khoảng trắng ở đầu hoặc cuối.")]
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Tên thể loại phải có độ dài từ 1 đến 50 ký tự.")]
    public string TenTheLoai { get; set; }

    [RegularExpression(@"^(?!\s)(.*[^\s])?$", ErrorMessage = "Mô tả không được có khoảng trắng ở đầu hoặc cuối.")]
    [StringLength(100, ErrorMessage = "mô tả thể loại phải có độ dài từ 1 đến 100 ký tự.")]
    public string? MoTa { get; set; }

    [Required(ErrorMessage = "Phân loại không được để trống.")]
    [RegularExpression("^(Thu|Chi)$", ErrorMessage = "Phân loại chỉ được nhận giá trị 'Thu' hoặc 'Chi'.")]
    public string PhanLoai { get; set; }

    public int? UserId { get; set; }
    [ForeignKey("UserId")]
    public virtual User? User { get; set; } = null!;
}
