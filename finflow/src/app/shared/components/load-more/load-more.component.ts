import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-load-more',
   standalone: true,
   imports: [CommonModule, NgIcon],
   template: `
      <div class="load-more-container">
         <button
            *ngIf="hasMore"
            class="btn btn-secondary load-more-btn"
            [disabled]="isLoading"
            (click)="onLoad.emit()"
         >
            <div *ngIf="isLoading" class="spinner">
               <ng-icon name="lucideLoader"></ng-icon>
            </div>
            <span>{{ isLoading ? 'Đang tải dữ liệu...' : 'Tải thêm giao dịch' }}</span>
            <div *ngIf="!isLoading" class="arrow-down">
               <ng-icon name="lucideChevronDown"></ng-icon>
            </div>
         </button>

         <p *ngIf="!hasMore" class="no-more-text">Đã hiển thị toàn bộ lịch sử giao dịch.</p>
      </div>
   `,
   styles: [
      `
         .load-more-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem 0;
            width: 100%;
         }

         .load-more-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 2rem;
            border-radius: 50px;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-main);
            background-color: var(--bg-surface);
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            transition: all 0.2s ease;

            &:hover:not(:disabled) {
               transform: translateY(-2px);
               background-color: var(--bg-surface-hover);
               box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
            }

            &:disabled {
               opacity: 0.7;
               cursor: not-wait;
               transform: none;
            }

            .spinner {
               width: 18px;
               height: 18px;
               animation: spin 1s linear infinite;
               color: var(--text-muted);
            }

            .arrow-down {
               width: 16px;
               height: 16px;
               color: var(--text-muted);
            }
         }

         .no-more-text {
            font-size: 0.85rem;
            color: var(--text-muted);
            font-weight: 500;
            font-style: italic;
         }

         @keyframes spin {
            from {
               transform: rotate(0deg);
            }
            to {
               transform: rotate(360deg);
            }
         }
      `,
   ],
})
export class LoadMoreComponent {
   @Input() isLoading: boolean = false;
   @Input() hasMore: boolean = true;
   @Output() onLoad = new EventEmitter<void>();
}
