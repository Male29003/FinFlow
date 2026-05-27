import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-pagination',
   standalone: true,
   imports: [CommonModule, NgIcon],
   template: `
      <div class="pagination-wrapper" *ngIf="totalCount > 0">
         <div class="pagination-left">
            <div class="pagination-info text-muted">
               Hiển thị <strong>{{ startItem }}</strong> - <strong>{{ endItem }}</strong> /
               <strong>{{ totalCount }}</strong>
            </div>

            <div class="page-size-selector">
               <select (change)="onPageSizeChange($event)">
                  <option
                     *ngFor="let size of pageSizeOptions"
                     [value]="size"
                     [selected]="size === pageSize"
                  >
                     {{ size }} / trang
                  </option>
               </select>
            </div>
         </div>

         <div class="pagination-controls">
            <button class="btn-page" [disabled]="page === 1" (click)="onPageChange(page - 1)">
               <ng-icon name="lucideChevronLeft"></ng-icon>
               Trước
            </button>

            <div class="page-numbers">
               <span class="page-current">Trang {{ page }} / {{ totalPages }}</span>
            </div>

            <button
               class="btn-page"
               [disabled]="page >= totalPages"
               (click)="onPageChange(page + 1)"
            >
               Sau
               <ng-icon name="lucideChevronRight"></ng-icon>
            </button>
         </div>
      </div>
   `,
   styles: [
      `
         .pagination-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            margin-top: 1.5rem;

            background-color: rgba(var(--bg-surface-rgb), 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(var(--bg-surface-rgb), 0.4);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);

            flex-wrap: wrap;
            gap: 1rem;
         }

         .pagination-left {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            flex-wrap: wrap;
         }

         .pagination-info {
            font-size: 0.85rem;
            color: var(--text-muted);
            strong {
               color: var(--text-main);
               font-weight: 600;
            }
         }

         .page-size-selector select {
            padding: 0.4rem 0.75rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background-color: var(--bg-surface);
            color: var(--text-main);
            font-size: 0.85rem;
            font-weight: 600;
            outline: none;
            cursor: pointer;
            transition: all 0.2s ease;
         }

         .page-size-selector select:hover {
            border-color: #94a3b8;
         }

         .pagination-controls {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--bg-surface-hover);
            padding: 4px;
            border-radius: 10px;
            border: 1px solid var(--border-color);
         }

         .page-numbers {
            padding: 0 0.75rem;
            .page-current {
               font-size: 0.85rem;
               font-weight: 600;
               color: var(--text-main);
            }
         }

         .btn-page {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            background: var(--bg-surface);
            border: none;
            color: var(--text-main);
            padding: 0.4rem 0.75rem;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

            svg {
               width: 16px;
               height: 16px;
            }

            &:hover:not(:disabled) {
               background: var(--border-color);
            }

            &:disabled {
               opacity: 0.4;
               cursor: not-allowed;
               box-shadow: none;
            }
         }

         @media (max-width: 650px) {
            .pagination-wrapper {
               flex-direction: column;
               justify-content: center;
            }
            .pagination-left {
               justify-content: center;
            }
            .pagination-controls {
               width: 100%;
               justify-content: space-between;
            }
         }
      `,
   ],
})
export class PaginationComponent {
   @Input() page: number = 1;
   @Input() pageSize: number = 10;
   @Input() totalCount: number = 0;
   @Input() pageSizeOptions: number[] = [5, 10, 15, 20, 50];

   @Output() pageChange = new EventEmitter<number>();
   @Output() pageSizeChange = new EventEmitter<number>();

   get totalPages(): number {
      return Math.ceil(this.totalCount / this.pageSize) || 1;
   }

   get startItem(): number {
      return this.totalCount === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
   }

   get endItem(): number {
      return Math.min(this.page * this.pageSize, this.totalCount);
   }

   onPageChange(newPage: number) {
      if (newPage >= 1 && newPage <= this.totalPages) {
         this.pageChange.emit(newPage);
      }
   }

   onPageSizeChange(event: Event) {
      const selectElement = event.target as HTMLSelectElement;
      const newSize = parseInt(selectElement.value, 10);

      this.pageSizeChange.emit(newSize);

      this.pageChange.emit(1);
   }
}
