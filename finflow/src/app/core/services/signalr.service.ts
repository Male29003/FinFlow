import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SignalRService {
   private hubConnection!: signalR.HubConnection;
   private authService = inject(AuthService);

   // Cái loa nội bộ của Angular
   private transactionChangedSubject = new Subject<void>();
   transactionChanged$ = this.transactionChangedSubject.asObservable();

   public startConnection = () => {
      // Kết nối tới URL BE vừa cấu hình
      this.hubConnection = new signalR.HubConnectionBuilder()
         .withUrl('https://localhost:7220/transaction-hub')
         .withAutomaticReconnect() // Tự kết nối lại nếu rớt mạng
         .build();

      this.hubConnection
         .start()
         .then(() => console.log('SignalR đã kết nối thành công!'))
         .catch((err) => console.log('Lỗi kết nối SignalR: ', err));

      // Lắng nghe tín hiệu "OnTransactionChanged" từ BE gửi xuống
      this.hubConnection.on('OnTransactionChanged', (updatedUserId: number) => {
         // Kiểm tra xem User đang đăng nhập có trùng với User vừa có biến động không
         const currentUser = this.authService['currentUserSubject'].value;

         if (currentUser && Number(currentUser.id) === updatedUserId) {
            console.log('⚡ Có biến động dữ liệu, tải lại trang...');
            this.transactionChangedSubject.next(); // Kích hoạt reload
         }
      });
   };
}
