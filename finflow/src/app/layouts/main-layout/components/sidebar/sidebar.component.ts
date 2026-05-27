import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../../../shared/services/layout.service';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-sidebar',
   standalone: true,
   imports: [CommonModule, RouterLink, RouterLinkActive, NgIcon],
   templateUrl: './sidebar.component.html',
   styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
   isLoaded = false;
   isExpanded = true;
   isCatalogOpen = false;
   private layoutService = inject(LayoutService);
   private router = inject(Router);

   ngOnInit(): void {
      this.layoutService.isSidebarExpanded$.subscribe((state) => {
         this.isExpanded = state;
         if (!state) this.isCatalogOpen = false;
      });
      this.checkScreenSize();
      setTimeout(() => {
         this.isLoaded = true;
      }, 50);
   }

   @HostListener('window:resize', ['$event'])
   onResize(event: any) {
      this.checkScreenSize();
   }

   checkScreenSize() {
      const width = window.innerWidth;
      if (width >= 768 && width < 1024) {
         this.layoutService.setSidebarState(false);
      } else if (width >= 1024) {
         const savedState = localStorage.getItem('sidebarExpanded');
         if (savedState !== 'false') {
            this.layoutService.setSidebarState(true);
         }
      }
   }

   toggleCatalogMenu(event: Event) {
      event.stopPropagation();
      this.isCatalogOpen = !this.isCatalogOpen;
   }

   @HostListener('document:click')
   closeCatalogMenu() {
      if (!this.isExpanded) {
         this.isCatalogOpen = false;
      }
   }

   goToHome(): void {
      this.router.navigate(['/']);
   }
}
