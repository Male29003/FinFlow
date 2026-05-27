import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { AccountTypeService } from '../../../account-types/services/account-type.service';
import { Account, AccountType } from '../../../../shared/models/account.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.compnent';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-account-page',
   standalone: true,
   imports: [CommonModule, FormsModule, PaginationComponent, NgIcon],
   templateUrl: './account-page.component.html',
   styleUrls: ['./account-page.component.scss'],
})
export class AccountPageComponent implements OnInit {
   private accountService = inject(AccountService);
   private accountTypeService = inject(AccountTypeService);
   private router = inject(Router);

   page = 1;
   pageSize = 10;
   totalCount = 0;
   isLoading = false;

   accounts: Account[] = [];
   accountTypesList: AccountType[] = [];

   isLinkBankModalOpen = false;
   isCreateModalOpen = false;
   isUpdateModalOpen = false;
   isLinking = false;

   selectedAccount: Account | null = null;
   newTypeName = '';
   selectedTypeId: number | null = null;

   linkBankData = { tenNganHang: 'Vietcombank', soTaiKhoan: '', isDemo: true };

   changePage(newPage: number) {
      this.page = newPage;
      this.loadData();
   }
   changePageSize(newSize: number) {
      this.pageSize = newSize;
   }

   ngOnInit(): void {
      this.loadData();
      this.accountTypeService.getAllAccountTypes().subscribe((res: any) => {
         this.accountTypesList = res.data ? res.data : res;
      });
   }

   loadData(): void {
      this.isLoading = true;
      this.accountService.getAccounts(this.page, this.pageSize).subscribe({
         next: (res: any) => {
            this.accounts = res.data ? res.data : res;
            this.totalCount = res.totalCount ? res.totalCount : 0;
            this.isLoading = false;
         },
         error: () => (this.isLoading = false),
      });
   }
   // lấy tên loại tài khoảng ra
   getAccountTypeName(loaiTaiKhoanId: number): string {
      if (!this.accountTypesList || this.accountTypesList.length === 0) return 'Ví tiền';

      const matchedType = this.accountTypesList.find((t) => t.id === loaiTaiKhoanId);
      return matchedType ? matchedType.ten : 'Ví tiền';
   }

   openCreate(): void {
      this.newTypeName = '';
      this.selectedTypeId = null;
      this.isCreateModalOpen = true;
   }

   submitCreate(): void {
      if (!this.newTypeName || !this.selectedTypeId) return;
      this.accountService
         .createAccount({
            tenTaiKhoan: this.newTypeName,
            loaiTaiKhoanId: this.selectedTypeId,
            soDu: 0,
         })
         .subscribe({
            next: () => {
               this.isCreateModalOpen = false;
               this.loadData();
            },
            error: (err) => {
               const msg = err.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
               alert(msg);
            },
         });
   }

   openUpdate(item: Account): void {
      this.selectedAccount = item;
      this.newTypeName = item.tenTaiKhoan;
      this.isUpdateModalOpen = true;
   }

   submitUpdate(): void {
      if (!this.selectedAccount || !this.newTypeName) return;
      const payload = {
         tenTaiKhoan: this.newTypeName,
         loaiTaiKhoanId: this.selectedAccount.loaiTaiKhoanId,
      };

      this.accountService.updateAccount(this.selectedAccount.id, payload).subscribe({
         next: (res: any) => {
            if (res && res.success == true) {
               this.isUpdateModalOpen = false;
               this.loadData();
            }
         },
         error: (err) => {
            const msg = err.data.message || err.message || 'Có lỗi xảy ra. Vui lòng thủ lại!';
            alert(msg);
         },
      });
   }

   handleDelete(id: number): void {
      if (confirm('Xóa tài khoản này sẽ ảnh hưởng đến các giao dịch. Bạn chắc chứ?')) {
         this.accountService.deleteAccount(id).subscribe(() => this.loadData());
      }
   }

   openLinkBankModal(): void {
      this.linkBankData = { tenNganHang: 'Vietcombank', soTaiKhoan: '', isDemo: true };
      this.isLinkBankModalOpen = true;
   }

   submitLinkBank(): void {
      if (!this.linkBankData.soTaiKhoan) return alert('Vui lòng nhập số tài khoản!');
      this.isLinking = true;
      this.accountService.linkBank(this.linkBankData).subscribe({
         next: () => {
            this.isLinkBankModalOpen = false;
            this.isLinking = false;
            this.loadData();
         },
         error: (err) => {
            const msg = err.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            alert(msg);
            this.isLinking = false;
         },
      });
   }

   goBack(): void {
      this.router.navigate(['/menu']);
   }
}
