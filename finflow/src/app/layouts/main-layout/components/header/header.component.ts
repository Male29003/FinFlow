import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../../../shared/services/layout.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../shared/services/theme.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-header',
   standalone: true,
   imports: [CommonModule, NgIcon],
   template: `
      <div class="header-container">
         <div class="header-left">
            <button class="icon-btn menu-toggle-btn" (click)="toggleSidebar()">
               <ng-icon name="lucideMenu"></ng-icon>
            </button>
         </div>

         <div class="header-right">
            <button class="icon-btn theme-btn" (click)="themeService.toggleTheme()">
               <div *ngIf="!themeService.isDarkMode()">
                  <ng-icon name="lucideMoon"></ng-icon>
               </div>
               <div *ngIf="themeService.isDarkMode()">
                  <ng-icon name="lucideSun"></ng-icon>
               </div>
            </button>

            <!-- <button class="icon-btn noti-btn">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
               </svg>
               <span class="noti-badge"></span>
            </button> -->

            <div class="user-profile-wrapper" (click)="toggleProfile($event)">
               <img
                  class="avatar-img"
                  [src]="avatarUrl"
                  onerror="this.src='https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'"
               />

               <div class="profile-dropdown" [class.open]="isProfileOpen">
                  <div class="dropdown-header">
                     <p class="user-name">Khách hàng</p>
                     <p class="user-role">Free Plan</p>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item" (click)="openProfile()">Hồ sơ cá nhân</a>
                  <a class="dropdown-item" (click)="handleLogout()">Đăng xuất</a>
               </div>
            </div>
         </div>
      </div>
   `,
   styleUrls: ['./header.component.scss'],
})
export class TopHeaderComponent {
   private layoutService = inject(LayoutService);
   private authService = inject(AuthService);
   private router = inject(Router);
   private buildAvatarUrl(name: string): string {
      const encoded = encodeURIComponent(name);
      return `https://ui-avatars.com/api/?name=${encoded}&background=185fa5&color=fff&size=128&bold=true&rounded=true`;
   }

   user: any = null;
   avatarUrl: string = 'assets/images/avatar-placeholder.png';
   themeService = inject(ThemeService);
   isProfileOpen = false;

   ngOnInit(): void {
      this.authService.currentUser$.subscribe((userData) => {
         if (userData) {
            this.user = userData;
            const name = userData.hoTen || userData.name || userData.username || 'User';
            this.avatarUrl = this.buildAvatarUrl(name);
         } else {
            this.user = null;
            this.avatarUrl = 'assets/images/avatar-placeholder.png';
         }
      });
   }

   toggleSidebar() {
      this.layoutService.toggleSidebar();
   }

   toggleProfile(event: Event) {
      event.stopPropagation();
      this.isProfileOpen = !this.isProfileOpen;
   }
   @HostListener('document:click')
   closeProfile() {
      this.isProfileOpen = false;
   }

   handleLogout() {
      this.authService.logout();
   }
   openProfile() {
      this.router.navigate(['/profile']);
   }
}
