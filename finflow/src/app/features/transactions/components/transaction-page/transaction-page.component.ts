import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../../../shared/models/transaction.model';
import { LoadMoreComponent } from '../../../../shared/components/load-more/load-more.component';
import { NgIconComponent } from '@ng-icons/core';
import { TransactionModalService } from '../../../../core/services/transaction-modal.service';
import { ConfirmService } from '../../../../shared/services/confirm.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { SignalRService } from '../../../../core/services/signalr.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
   selector: 'app-transaction-page',
   standalone: true,
   imports: [CommonModule, LoadMoreComponent, NgIconComponent],
   templateUrl: './transaction-page.component.html',
   styleUrls: ['./transaction-page.component.scss'],
})
export class TransactionPageComponent implements OnInit {
   private transactionService = inject(TransactionService);
   private modalService = inject(TransactionModalService);
   private confirmService = inject(ConfirmService);
   private toast = inject(ToastService);
   private signalRService = inject(SignalRService);
   private destroyRef = inject(DestroyRef);

   transactions: Transaction[] = [];
   page = 1;
   pageSize = 10;
   filter: string = '';
   hasMore = true;
   isLoading = false;

   ngOnInit(): void {
      this.loadData();

      // Nếu modal lưu thành công -> Load lại danh sách
      this.modalService.transactionChanged$.subscribe(() => {
         this.page = 1;
         this.transactions = [];
         this.loadData();
      });

      this.signalRService.transactionChanged$
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(() => {
            this.page = 1;
            this.transactions = [];
            this.loadData(false, true);
         });
   }

   loadData(isAppend: boolean = false, isSilent: boolean = false): void {
      if (!isSilent) {
         this.isLoading = true;
      }
      this.transactionService
         .getTransactions(this.page, this.pageSize, '', '', this.filter)
         .subscribe({
            next: (res: any) => {
               const extracted = res.data || res.item || res;
               const newData: Transaction[] = Array.isArray(extracted) ? extracted : [];

               if (isAppend) this.transactions = [...this.transactions, ...newData];
               else this.transactions = newData;

               this.hasMore = newData.length >= this.pageSize;
               if (!isSilent) {
                  this.isLoading = false;
               }
            },
            error: () => {
               this.toast.error('Đã xảy ra lỗi khi tải dữ liệu.');
               if (!isSilent) {
                  this.isLoading = false;
               }
            },
         });
   }

   onFilterChange(type: string): void {
      this.filter = type;
      this.page = 1;
      this.transactions = [];
      this.loadData();
   }

   onLoadMore(): void {
      this.page++;
      this.loadData(true);
   }

   // Mở Modal
   openModal(tx?: Transaction): void {
      this.modalService.open(tx);
   }

   // Xóa
   async deleteTx(id: number) {
      const isConfirmed = await this.confirmService.confirm(
         'Xóa giao dịch',
         'Bạn có chắc chắn muốn xóa giao dịch này? Hành động này không thể hoàn tác.',
         'Xóa',
         'Hủy',
      );

      if (isConfirmed) {
         this.transactionService.deleteTransaction(id).subscribe({
            next: () => {
               this.toast.success('Xóa giao dịch thành công!');
               this.page = 1;
               this.transactions = [];
               this.loadData();
            },
            error: () => this.toast.error('Lỗi khi xóa giao dịch.'),
         });
      }
   }
}
