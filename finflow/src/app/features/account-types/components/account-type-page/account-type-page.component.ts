import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountTypeService } from '../../services/account-type.service';
import { AccountType } from '../../../../shared/models/account.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.compnent';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmService } from '../../../../shared/services/confirm.service';

@Component({
   selector: 'app-account-type-page',
   standalone: true,
   imports: [CommonModule, FormsModule, PaginationComponent, NgIcon],
   templateUrl: './account-type-page.component.html',
   styleUrls: ['./account-type-page.component.scss'],
})
export class AccountTypePageComponent implements OnInit {
   private accountTypeService = inject(AccountTypeService);
   private router = inject(Router);
   private toastService = inject(ToastService);
   private confirmService = inject(ConfirmService);

   accountTypes: AccountType[] = [];
   totalCount = 0;

   page = 1;
   pageSize = 10;
   keyword = '';
   isLoading = false;

   isModalOpen = false;
   isEditMode = false;

   selectedItem: AccountType | null = null;
   newTypeName = '';

   ngOnInit(): void {
      this.loadData();
   }

   changePage(newPage: number) {
      this.page = newPage;
      this.loadData();
   }
   changePageSize(newSize: number) {
      this.pageSize = newSize;
   }

   loadData(): void {
      this.isLoading = true;
      this.accountTypeService.getAccountTypes(this.page, this.pageSize, this.keyword).subscribe({
         next: (res: any) => {
            this.accountTypes = res.data ? res.data : res;
            this.totalCount = res.totalCount || this.accountTypes.length;
            this.isLoading = false;
         },
         error: () => {
            this.isLoading = false;
         },
      });
   }

   onSearch(): void {
      this.page = 1;
      this.loadData();
   }

   openCreate(): void {
      this.isEditMode = false;
      this.selectedItem = null;
      this.newTypeName = '';
      this.isModalOpen = true;
   }

   openUpdate(item: AccountType): void {
      this.isEditMode = true;
      this.selectedItem = item;
      this.newTypeName = item.ten;
      this.isModalOpen = true;
   }

   submitForm(): void {
      if (!this.newTypeName.trim()) {
         this.toastService.warning('Vui lòng nhập tên loại tài khoản!');
         return;
      }

      const request = this.isEditMode
         ? this.accountTypeService.updateAccountType(this.selectedItem!.id, {
              ten: this.newTypeName,
           })
         : this.accountTypeService.createAccountType({ Ten: this.newTypeName });
      request.subscribe({
         next: () => {
            this.isModalOpen = false;
            this.toastService.success(this.isEditMode ? 'Cập nhật thành công.' : 'Tạo thành công.');
            this.loadData();
         },
         error: (err) => {
            const msg = err.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            this.toastService.error(msg);
            console.error(err);
         },
      });
   }

   async handleDelete(id: number) {
      if (!this.selectedItem) return;

      const isConfirmed = await this.confirmService.confirm(
         'Xóa loại tài khoản',
         'Xóa mục này có thể ảnh hưởng đến các tài khoản đang sử dụng. Bạn có chắc chắn xóa? Hành động này không thể hoàn tác.',
         'Xóa',
         'Hủy',
      );

      if (isConfirmed) {
         this.accountTypeService.deleteAccountType(id).subscribe({
            next: () => {
               this.toastService.success('Xóa thảnh công.');
               this.isModalOpen = false;
               this.page = 1;
               this.accountTypes = [];
               this.loadData();
            },
            error: (err) => {
               const msg = err.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
               this.toastService.error(msg);
            },
         });
      }
   }

   goBack(): void {
      this.router.navigate(['/menu']);
   }
}
