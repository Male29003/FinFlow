using System;

public class TaiKhoanDTO
{
	public int id { get; set; }
    public string tenTaiKhoan { get; set; }
    public int loaiTaiKhoanId { get; set; }
    public LoaiTaiKhoanSimpleDTO? loaiTaiKhoan { get; set; }

    public double soDu { get; set; }

    public TaiKhoanDTO()
	{
        this.id = -1;
	}
}

public class LoaiTaiKhoanSimpleDTO
{
    public int id { get; set; }
    public string ten { get; set; }
}