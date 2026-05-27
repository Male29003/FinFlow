import { Account } from './account.model';

export interface Category {
   id: number;
   tenTheLoai: string;
   phanLoai: 'Thu' | 'Chi';
   userId?: number;
   moTa?: string;
   createdAt: string;
   updatedAt?: string;
}

export interface Transaction {
   id: number;
   tenGiaoDich: string;
   ngayGiaoDich: string;
   tongTien: number;
   ghiChu: string;
   taiKhoanGoc: Account;
   taiKhoanPhu?: Account;
   theLoai: Category;
   userId: string;
   createdAt: string;
   updatedAt?: string;
}
