import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AccountService } from '../../../accounts/services/account.service';
import { TransactionService } from '../../../transactions/services/transaction.service';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { SignalRService } from '../../../../core/services/signalr.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
   selector: 'app-dashboard-page',
   standalone: true,
   imports: [CommonModule, FormsModule, NgIcon],
   templateUrl: './dashboard-page.component.html',
   styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit {
   private accountService = inject(AccountService);
   private transactionService = inject(TransactionService);
   private signalRService = inject(SignalRService);
   private destroyRef = inject(DestroyRef);

   totalBalance = 0;
   totalIncome = 0;
   totalExpense = 0;

   selectedMonth: string = '';

   accountsData: any[] = [];
   recentTransactions: any[] = [];
   chartData: any[] = [];
   isLoading = true;

   ngOnInit(): void {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      this.selectedMonth = `${year}-${month}`;
      this.loadData();

      this.signalRService.transactionChanged$
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(() => {
            this.loadData(true);
         });
   }
   loadData(isSilent: boolean = false): void {
      if (!isSilent) {
         this.isLoading = true;
      }
      // Tách lấy ngày đầu và cuối tháng
      const [year, month] = this.selectedMonth.split('-');
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

      const utcStartDate = startDate.toISOString();
      const utcEndDate = endDate.toISOString();

      forkJoin({
         accounts: this.accountService.getAllAccounts(),
         transactions: this.transactionService.getTransactionsByDateRange(
            1,
            9999,
            utcStartDate,
            utcEndDate,
         ),
      }).subscribe({
         next: (res: any) => {
            this.accountsData = res.accounts.data ? res.accounts.data : res.accounts;
            this.totalBalance = this.accountsData.reduce(
               (acc: any, curr: any) => acc + (curr.soDu || 0),
               0,
            );

            const allTransactions = res.transactions.data
               ? res.transactions.data
               : res.transactions;
            // tính tổng thu chi
            this.totalIncome = allTransactions
               .filter((t: any) => t.theLoai?.phanLoai === 'Thu')
               .reduce((acc: any, curr: any) => acc + curr.tongTien, 0);
            this.totalExpense = allTransactions
               .filter((t: any) => t.theLoai?.phanLoai === 'Chi')
               .reduce((acc: any, curr: any) => acc + curr.tongTien, 0);
            // tách ra 5 giao dịch gần nhất
            this.recentTransactions = allTransactions.slice(0, 5);

            this.chartData = this.processTransactionData(
               allTransactions,
               Number(year),
               Number(month),
            );

            if (!isSilent) {
               this.isLoading = false;
            }
         },
         error: (err) => {
            const msg = err.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            alert(msg);
            console.error('Lỗi tải dữ liệu Dashboard:', err);
            if (!isSilent) {
               this.isLoading = false;
            }
         },
      });
   }

   private processTransactionData(transactions: any[], year: number, month: number): any[] {
      const daysInMonth = new Date(year, month, 0).getDate();
      const dailyData: any[] = [];

      // Tạo khung 30/31 ngày
      for (let i = 1; i <= daysInMonth; i++) {
         dailyData.push({ day: `Ngày ${i}`, income: 0, expense: 0 });
      }

      transactions.forEach((transaction) => {
         if (transaction.ngayGiaoDich) {
            const date = new Date(transaction.ngayGiaoDich);
            const dayIndex = date.getDate() - 1; // Mảng bắt đầu từ 0

            if (transaction.theLoai?.phanLoai === 'Thu') {
               dailyData[dayIndex].income += transaction.tongTien;
            } else if (transaction.theLoai?.phanLoai === 'Chi') {
               dailyData[dayIndex].expense += transaction.tongTien;
            }
         }
      });
      return dailyData;
   }
}
