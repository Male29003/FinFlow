import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopHeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { TransactionModalComponent } from '../../shared/components/transaction-modal/transaction-modal.component';

@Component({
   selector: 'app-main-layout',
   standalone: true,
   imports: [
      RouterOutlet,
      TopHeaderComponent,
      SidebarComponent,
      BottomNavComponent,
      TransactionModalComponent,
   ],
   template: `
      <div class="app-layout">
         <aside class="app-sidebar">
            <app-sidebar></app-sidebar>
         </aside>

         <main class="app-main">
            <header class="app-header">
               <app-header></app-header>
            </header>

            <section class="app-content">
               <div class="content-wrapper">
                  <router-outlet></router-outlet>
               </div>
            </section>
         </main>

         <nav class="app-bottom-nav">
            <app-bottom-nav></app-bottom-nav>
         </nav>

         <app-transaction-modal></app-transaction-modal>
      </div>
   `,
   styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {}
