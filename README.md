# 💸 FinFlow - Personal Finance Management

FinFlow là một ứng dụng web quản lý tài chính cá nhân hiện đại, giúp người dùng dễ dàng theo dõi thu nhập, chi tiêu và quản lý ngân sách hiệu quả. Dự án được xây dựng với mục tiêu mang lại trải nghiệm mượt mà, trực quan cùng khả năng đồng bộ dữ liệu theo thời gian thực.

![FinFlow Demo](https://via.placeholder.com/1000x500.png?text=Paste+Link+Anh+Demo+FinFlow+Vao+Day)

## Các chức năng chính

- **Bảo mật:** Đăng nhập / Đăng ký / Quên mật khẩu / Reset mật khẩu sử dụng bảo mật JWT (Bearer Token).
- **Dashboard:** Theo dõi số dư, tổng thu/chi và các giao dịch gần nhất.
- **Quản lý tài chính:** Tự do thêm, sửa, xóa tài khoản, thể loại giao dịch và các lịch sử thu/chi của bản thân.
- **Thống kê thu chi:** Thống kê dòng tiền theo khoảng thời gian mong muốn. Bảng phân tích tỷ lệ Thu/Chi chi tiết và biểu đồ đối soát theo từng tài khoản.
- **Giả lập liên kết ngân hàng:** Chế độ Auto-Sync tự động cấp 1 tài khoản mẫu và tạo các giao dịch ngẫu nhiên để người dùng trải nghiệm nhanh tính năng.

## Tech Stack

<p>
  <img src="https://img.shields.io/badge/Angular_17-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white" alt="SCSS" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />
  <img src="https://img.shields.io/badge/.NET_8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET 8" />
</p>

## Giao diện ứng dụng

### Trang Home

### Trang Dashboard

### Trang Quản lý Giao dịch

### Trang Quản lý Tài khoản

### Trang Quản lý Loại tài khoản

### Trang Quản lý Thể loại giao dịch

### Trang Quản lý Thống kê

## Hướng dẫn cài đặt

Repository này chứa cả mã nguồn Frontend (Angular) và Backend (.NET). Để chạy dự án trên máy local, bạn cần thiết lập lần lượt Backend rồi mới đến Frontend.

### Lưu ý: Yêu cầu hệ thống:

- Node.js & npm
- .NET 8 SDK
- Cơ sở dữ liệu **PostgreSQL** đã được cài đặt dưới local.

---

### Cài đặt Backend (.NET)

1. Clone repository này về máy:

```bash
   git clone [https://github.com/Male29003/FinFlow.git](https://github.com/Male29003/FinFlow.git)
```

2. Mở thư mục backend bằng Visual Studio. Tìm đến file `appsettings.json` (nằm trong `Presentation/WebAPIs`) và thay đổi chuỗi `DefaultConnection` khớp với Database dưới local của bạn:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=[ten-database-cua-ban];Username=[ten-user-cua-ban];Password=[password-cua-ban]"
}

```

3. Mở **Package Manager Console** lên và chạy lệnh sau để khởi tạo database:

```powershell
Update-Database

```

4. Bấm nút **Run (F5)** của IDE để khởi chạy phần xử lý Backend.

### Cài đặt Frontend

5. Mở terminal mới và di chuyển vào thư mục frontend:

```bash
cd finflow

```

6. Cài đặt các thư viện cần thiết:

```bash
npm install

```

7. Mở file cấu hình môi trường tại `src/environments/environment.ts` và đảm bảo đường dẫn API khớp với Backend vừa chạy ở bước trên:

```typescript
export const environment = {
  production: false,
  apiUrl: "https://localhost:7220/api/v1", // Đổi lại port này nếu máy bạn chạy port khác
};
```

8. Khởi chạy giao diện Frontend:

```bash
ng serve

```

## 📫 Thông tin liên hệ

Nếu bạn có bất kỳ thắc mắc nào về dự án hoặc gặp khó khăn khi cài đặt, vui lòng liên hệ với tôi qua email: **namnguyen23009@gmail.com**
