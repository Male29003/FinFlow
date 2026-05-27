import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../services/confirm.service';

@Component({
   selector: 'app-confirm-modal',
   standalone: true,
   imports: [CommonModule],
   template: `
      <div
         class="modal-overlay"
         *ngIf="(confirmService.state$ | async)?.show"
         (click)="onRespond(false)"
      >
         <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
               <h3>{{ (confirmService.state$ | async)?.title }}</h3>
            </div>

            <div class="modal-body">
               <p>{{ (confirmService.state$ | async)?.message }}</p>
            </div>

            <div class="modal-footer">
               <button class="btn btn-outline" (click)="onRespond(false)">
                  {{ (confirmService.state$ | async)?.cancelText }}
               </button>
               <button class="btn btn-danger" (click)="onRespond(true)">
                  {{ (confirmService.state$ | async)?.confirmText }}
               </button>
            </div>
         </div>
      </div>
   `,
   styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent {
   confirmService = inject(ConfirmService);

   onRespond(res: boolean) {
      this.confirmService.respond(res);
   }
}
