import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
   lucideCheckCircle,
   lucideXCircle,
   lucideAlertTriangle,
   lucideInfo,
   lucideX,
} from '@ng-icons/lucide';

@Component({
   selector: 'app-toast',
   standalone: true,
   imports: [CommonModule, NgIconComponent],
   providers: [
      provideIcons({ lucideCheckCircle, lucideXCircle, lucideAlertTriangle, lucideInfo, lucideX }),
   ],
   template: `
      <div class="toast-container">
         <div
            *ngFor="let toast of toastService.toasts$ | async"
            class="toast-item"
            [ngClass]="'toast-' + toast.type"
         >
            <div class="toast-icon">
               <ng-container [ngSwitch]="toast.type">
                  <ng-icon *ngSwitchCase="'success'" name="lucideCheckCircle"></ng-icon>
                  <ng-icon *ngSwitchCase="'error'" name="lucideXCircle"></ng-icon>
                  <ng-icon *ngSwitchCase="'warning'" name="lucideAlertTriangle"></ng-icon>
                  <ng-icon *ngSwitchDefault name="lucideInfo"></ng-icon>
               </ng-container>
            </div>

            <div class="toast-message">{{ toast.message }}</div>

            <button class="toast-close" (click)="toastService.remove(toast.id)">
               <ng-icon name="lucideX"></ng-icon>
            </button>
         </div>
      </div>
   `,
   styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
   toastService = inject(ToastService);
}
