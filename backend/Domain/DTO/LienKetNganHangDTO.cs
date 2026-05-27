using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.DTO
{
    public class LienKetNganHangDTO
    {
        public string TenNganHang { get; set; }
        public string SoTaiKhoanNganHang { get; set; }
        public string TokenLienKet { get; set; } 
        public bool TrangThaiActive { get; set; } = true;
        public int UserId { get; set; }

        public LienKetNganHangDTO()
	    {
	    }
    }
}

