import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-grouped-bar-chart-by-account',
   standalone: true,
   imports: [BaseChartDirective, NgIcon],
   template: `<div class="chart-container">
      <canvas baseChart [data]="chartData" [options]="chartOptions" [type]="'bar'"></canvas>
   </div>`,
   styles: [
      `
         .chart-container {
            position: relative;
            height: 100%;
            width: 100%;
            min-height: 380px;
         }
      `,
   ],
})
export class GroupedBarChartByAccountComponent implements OnChanges {
   @Input() transactionData: any[] = [];
   // lấy biến màu từ css _variables
   private getCssVariable(name: string, fallback: string): string {
      if (typeof window !== 'undefined') {
         const color = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
         return color || fallback;
      }
      return fallback;
   }

   chartData: ChartData<'bar'> = { labels: [], datasets: [] };

   chartOptions: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
         padding: 10,
      },
      plugins: {
         legend: {
            display: false,
         },
         tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            cornerRadius: 8,
         },
      },
      hover: {
         mode: 'index',
         intersect: false,
      },
      elements: {
         bar: {
            borderRadius: 6,
            borderWidth: 0,
            hoverBorderWidth: 0,
         },
      },
   };

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['transactionData'] && this.transactionData) {
         // lấy màu
         const successColor = `rgb(${this.getCssVariable('--success-rgb', '40, 167, 69')})`;
         const errorColor = `rgb(${this.getCssVariable('--error-rgb', '220, 53, 69')})`;
         // Lọc ra danh sách tên tài khoản
         const uniqueAccounts = Array.from(new Set(this.transactionData.map((a) => a.tenTaiKhoan)));

         const incomeData = uniqueAccounts.map((accName) => {
            return this.transactionData
               .filter((x) => x.tenTaiKhoan === accName)
               .reduce((sum, curr) => sum + (curr.tongThu || 0), 0);
         });

         const expenseData = uniqueAccounts.map((accName) => {
            return this.transactionData
               .filter((x) => x.tenTaiKhoan === accName)
               .reduce((sum, curr) => sum + (curr.tongChi || 0), 0);
         });

         this.chartData = {
            labels: uniqueAccounts,
            datasets: [
               {
                  data: incomeData,
                  label: 'Tổng Thu',
                  backgroundColor: successColor,
                  borderRadius: 6,
                  maxBarThickness: 45,
               },
               {
                  data: expenseData,
                  label: 'Tổng Chi',
                  backgroundColor: errorColor,
                  borderRadius: 6,
                  maxBarThickness: 45,
               },
            ],
         };
      }
   }
}
