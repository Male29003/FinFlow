import { Injectable, signal } from '@angular/core';

@Injectable({
   providedIn: 'root',
})
export class ThemeService {
   isDarkMode = signal<boolean>(false);

   constructor() {
      this.initTheme();
   }

   private initTheme() {
      // Check xem có đang chạy trên trình duyệt không (Tránh lỗi nếu bật SSR)
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
         const savedTheme = localStorage.getItem('app-theme');
         if (savedTheme === 'dark') {
            this.setDarkTheme(true);
         } else {
            this.setDarkTheme(false);
         }
      }
   }

   toggleTheme() {
      this.setDarkTheme(!this.isDarkMode());
   }

   private setDarkTheme(isDark: boolean) {
      this.isDarkMode.set(isDark);

      if (typeof document !== 'undefined') {
         if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('app-theme', 'dark');
         } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('app-theme', 'light');
         }
      }
   }
}
