using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("LienKetNganHang")]
public class LienKetNganHang : BaseEntity
{
    [Required]
    public string TenNganHang { get; set; }
    [Required]
    public string SoTaiKhoanNganHang { get; set; }
    public string TokenLienKet { get; set; }
    public bool TrangThaiActive { get; set; } = true;

    public int UserId { get; set; }
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
}