import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-home-footer',
   standalone: true,
   imports: [CommonModule],
   template: `
      <footer class="home-footer">
         <div class="footer-container">
            <div class="footer-brand">
               <div class="logo">
                  <img src="assets/brand/logo.png" alt="FinFlow Logo" class="logo-img" />
                  <span class="logo-text">FinFlow</span>
               </div>
               <p>Quản lý tài chính cá nhân đơn giản và hiệu quả.</p>
            </div>
            <div class="footer-links">
               <div class="column">
                  <h4>Liên hệ</h4>
                  <p>Email: namnguyen23009@gmail.com</p>
                  <p>Support: 0707941024</p>
               </div>
               <div class="column">
                  <h4>Khác</h4>
                  <a href="#">Điều khoản sử dụng</a>
                  <a href="#">Chính sách bảo mật</a>
               </div>
            </div>
         </div>
         <div class="footer-bottom">
            <p>&copy; 2026 FinFlow - All Rights Reserved.</p>
         </div>
      </footer>
   `,
   styleUrls: ['./footer.component.scss'],
})
export class HomeFooterComponent {}
