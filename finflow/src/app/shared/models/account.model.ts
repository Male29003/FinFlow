export interface Account {
    id: number;
    tenTaiKhoan: string;
    loaiTaiKhoanId: number;
    loaiTaiKhoan: AccountType;
    soDu: number;
    createdAt: string;
    updatedAt?: string;
}

export interface AccountType {
    id: number;
    ten: string;
    createdAt?: string;
    updatedAt?: string;
}