using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DTO
{
    public class GiaoDichDTO
    {
        public int id { get; set; }
        public string tenGiaoDich { get; set; }
        public DateTime ngayGiaoDich { get; set; }
        //public string LoaiGiaoDich { get; set; }

        public TheLoaiDTO theLoai { get; set; } = null!;
        public double tongTien { get; set; }
        public string? ghiChu { get; set; }
        public virtual TaiKhoanDTO taiKhoanGoc { get; set; } = null!;
        public virtual TaiKhoanDTO? taiKhoanPhu { get; set; } = null!;

        public GiaoDichDTO(int id, string tenGiaoDich, DateTime ngayGiaoDich, TheLoaiDTO theLoai, double tongTien, string? ghiChu, TaiKhoanDTO taiKhoanGoc, TaiKhoanDTO? taiKhoanPhu)
        {
            this.id = id;
            this.tenGiaoDich = tenGiaoDich;
            this.ngayGiaoDich = ngayGiaoDich;
            this.theLoai = theLoai;
            this.tongTien = tongTien;
            this.ghiChu = ghiChu;
            this.taiKhoanGoc = taiKhoanGoc;
            this.taiKhoanPhu = taiKhoanPhu;
        }

        public GiaoDichDTO() { }
    }
}
