import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { TransactionModalService } from '../../../../core/services/transaction-modal.service';

@Component({
   selector: 'app-bottom-nav',
   standalone: true,
   imports: [CommonModule, RouterLink, RouterLinkActive, NgIcon],
   templateUrl: './bottom-nav.component.html',
   styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
   private transactionModalService = inject(TransactionModalService);

   openModal(): void {
      this.transactionModalService.open();
   }
}
