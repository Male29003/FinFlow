import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../services/confirm.service';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-confirm-modal',
   standalone: true,
   imports: [CommonModule, NgIcon],
   template: `
      <ng-container *ngIf="confirmService.state$ | async as state">
         <div class="modal-overlay" *ngIf="state.show" (click)="onRespond(false)">
            <div class="modal-content" (click)="$event.stopPropagation()">
               <div class="modal-header" [ngClass]="state.type || 'danger'">
                  <div class="modal-icon">
                     <ng-icon
                        *ngIf="state.type === 'danger'"
                        class="icon-danger"
                        name="lucideAlertTriangle"
                     ></ng-icon>
                     <ng-icon
                        *ngIf="state.type === 'primary'"
                        class="icon-primary"
                        name="lucideSave"
                     ></ng-icon>
                     <ng-icon
                        *ngIf="state.type === 'warning'"
                        class="icon-warning"
                        name="lucideInfo"
                     ></ng-icon>
                  </div>
                  <h3>{{ state.title }}</h3>
               </div>

               <div class="modal-body">
                  <p>{{ state.message }}</p>
               </div>

               <div class="modal-footer">
                  <button class="btn btn-outline" (click)="onRespond(false)">
                     {{ state.cancelText }}
                  </button>
                  <button
                     class="btn"
                     [ngClass]="'btn-' + (state.type || 'danger')"
                     (click)="onRespond(true)"
                  >
                     {{ state.confirmText }}
                  </button>
               </div>
            </div>
         </div>
      </ng-container>
   `,
   styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent {
   confirmService = inject(ConfirmService);

   onRespond(res: boolean) {
      this.confirmService.respond(res);
   }
}
