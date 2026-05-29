import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { StatisticService } from '../../services/statistic.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GroupedBarChartByAccountComponent } from '../grouped-bar-chart-by-account/grouped-bar-chart-by-account.component';
import { CategoryProgressListComponent } from '../category-progress-list/category-progress-list.component';
import { NgIcon } from '@ng-icons/core';
import { SignalRService } from '../../../../core/services/signalr.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../../shared/services/toast.service';
@Component({
   selector: 'app-statistic-page',
   standalone: true,
   imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      GroupedBarChartByAccountComponent,
      CategoryProgressListComponent,
      NgIcon,
   ],
   templateUrl: './statistic-page.component.html',
   styleUrls: ['./statistic-page.component.scss'],
})
export class StatisticPageComponent implements OnInit {
   private statisticService = inject(StatisticService);
   private signalRService = inject(SignalRService);
   private destroyRef = inject(DestroyRef);
   private toastService = inject(ToastService);

   // data cho chart thống kê theo tài khoản
   data: any[] = [];
   // data cho 2 bảng top giao dịch
   topIncome: any[] = [];
   topExpense: any[] = [];
   // data cho thống kê theo thể loại
   topExpenseCategories: any[] = [];
   topIncomeCategories: any[] = [];
   totalExpenseCat = 0;
   totalIncomeCat = 0;

   totalIncome = 0;
   totalIncomeCount = 0;
   totalExpense = 0;
   totalExpenseCount = 0;
   netBalance = 0;

   tuNgay: string = '';
   denNgay: string = '';
   isLoading = false;

   ngOnInit(): void {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      this.tuNgay = firstDay.toISOString().substring(0, 10);
      this.denNgay = today.toISOString().substring(0, 10);
      this.loadData();

      this.signalRService.transactionChanged$
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(() => {
            this.loadData(true);
         });
   }

   loadData(isSilent: boolean = false): void {
      if (!this.tuNgay || !this.denNgay) return this.toastService.warning('Vui lòng chọn ngày!');

      if (!isSilent) {
         this.isLoading = true;
      }

      const utcTuNgay = new Date(this.tuNgay).toISOString();
      const utcDenNgay = new Date(this.denNgay + 'T23:59:59').toISOString();

      this.statisticService.getStatByAccount(utcTuNgay, utcDenNgay).subscribe({
         next: (res: any) => {
            const rawData = res.data ? res.data : res;

            // giữ lại những tài khoản  phát sinh giao dịch
            this.data = rawData.filter((item: any) => item.tongThu > 0 || item.tongChi > 0);
            this.totalIncome = this.data.reduce(
               (sum: number, item: any) => sum + (item.tongThu || 0),
               0,
            );
            this.totalExpense = this.data.reduce(
               (sum: number, item: any) => sum + (item.tongChi || 0),
               0,
            );
            this.totalIncomeCount = this.data.reduce(
               (sum: number, item: any) => sum + (item.soLuongGiaoDichThu || 0),
               0,
            );
            this.totalExpenseCount = this.data.reduce(
               (sum: number, item: any) => sum + (item.soLuongGiaoDichChi || 0),
               0,
            );
            this.netBalance = this.totalIncome - this.totalExpense;

            this.topIncome = [...this.data]
               .filter((x: any) => x.tongThu > 0)
               .sort((a: any, b: any) => b.tongThu - a.tongThu);

            this.topExpense = [...this.data]
               .filter((x: any) => x.tongChi > 0)
               .sort((a: any, b: any) => b.tongChi - a.tongChi);

            if (!isSilent) {
               this.isLoading = false;
            }
         },
         error: (err) => {
            const msg = err.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            this.toastService.error(msg);
            if (!isSilent) {
               this.isLoading = false;
            }
         },
      });

      this.statisticService.getStatByTransactionType(utcTuNgay, utcDenNgay).subscribe({
         next: (res: any) => {
            const data = res.data || res;

            this.totalExpenseCat = data.reduce((sum: number, item: any) => sum + item.tongChi, 0);
            this.totalIncomeCat = data.reduce((sum: number, item: any) => sum + item.tongThu, 0);

            this.topExpenseCategories = data
               .filter((x: any) => x.tongChi > 0)
               .sort((a: any, b: any) => b.tongChi - a.tongChi);

            this.topIncomeCategories = data
               .filter((x: any) => x.tongThu > 0)
               .sort((a: any, b: any) => b.tongThu - a.tongThu);
         },
         error: (err) => {
            const msg = err.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            this.toastService.error(msg);
            this.isLoading = false;
         },
      });
   }
}
