import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-menu-page',
   standalone: true,
   imports: [CommonModule, RouterLink, NgIcon],
   templateUrl: './menu-page.component.html',
   styleUrl: './menu-page.component.scss',
})
export class MenuPageComponent implements OnInit {
   private authService = inject(AuthService);
   private themeService = inject(ThemeService);

   userName = 'Người dùng';
   userEmail = '';
   avatarUrl = '';

   get isDark(): boolean {
      return this.themeService.isDarkMode();
   }

   ngOnInit(): void {
      this.authService.currentUser$.subscribe((user) => {
         if (user) {
            this.userName = user.hoTen || user.name || 'Người dùng';
            this.userEmail = user.email || user.username || '';
            this.avatarUrl = this.buildAvatarUrl(this.userName);
         }
      });
      // fallback: đọc lại user từ localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
         const user = JSON.parse(stored);
         this.userName = user.hoTen || user.name || 'Người dùng';
         this.userEmail = user.email || user.username || '';
         this.avatarUrl = this.buildAvatarUrl(this.userName);
      }
   }

   private buildAvatarUrl(name: string): string {
      const encoded = encodeURIComponent(name);
      return `https://ui-avatars.com/api/?name=${encoded}&background=185fa5&color=fff&size=128&bold=true&rounded=true`;
   }

   toggleTheme(): void {
      this.themeService.toggleTheme();
   }

   logout(): void {
      this.authService.logout();
   }
}
