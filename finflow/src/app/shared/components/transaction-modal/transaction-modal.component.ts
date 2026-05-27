import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
   FormBuilder,
   FormGroup,
   ReactiveFormsModule,
   Validators,
   FormsModule,
} from '@angular/forms';
import { TransactionService } from '../../../features/transactions/services/transaction.service';
import { AccountService } from '../../../features/accounts/services/account.service';
import { TypeService } from '../../../features/category/service/type.service';
import { TransactionModalService } from '../../../core/services/transaction-modal.service';
import { ToastService } from '../../services/toast.service';
import { Category } from '../../../shared/models/transaction.model';
import { Account } from '../../../shared/models/account.model';

@Component({
   selector: 'app-transaction-modal',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, FormsModule],
   templateUrl: './transaction-modal.component.html',
   styleUrls: ['./transaction-modal.component.scss'],
})
export class TransactionModalComponent implements OnInit {
   private fb = inject(FormBuilder);
   private transactionService = inject(TransactionService);
   private accountService = inject(AccountService);
   private typeService = inject(TypeService);
   public modalService = inject(TransactionModalService);
   private toast = inject(ToastService);

   accounts: Account[] = [];
   categories: Category[] = [];
   filteredCategories: Category[] = [];
   displayAmount: string = '';

   isEditMode = false;
   selectedId: number | null = null;
   isTransferMode = false;

   txForm: FormGroup = this.fb.group({
      tenGiaoDich: ['', Validators.required],
      ngayGiaoDich: [new Date().toISOString().substring(0, 10), Validators.required],
      tongTien: [null, [Validators.required, Validators.min(1)]],
      loaiGiaoDich: ['Thu', Validators.required],
      theLoaiId: [null, Validators.required],
      taiKhoanGocId: [null, Validators.required],
      taiKhoanPhuId: [null],
      ghiChu: [''],
   });

   ngOnInit(): void {
      // Tải thể loại 1 lần khi app chạy
      this.typeService.getAllTypes().subscribe((res: any) => {
         this.categories = res.data ? res.data : res;
      });
      // tải tài khoản mỗi khi mở modal
      this.modalService.isOpen$.subscribe((isOpen) => {
         if (isOpen) {
            this.accountService.getAllAccounts().subscribe((res: any) => {
               this.accounts = res.data ? res.data : res;
            });
         }
      });

      // Lắng nghe tín hiệu mở Modal từ Service
      this.modalService.txToEdit$.subscribe((tx) => {
         if (tx) {
            this.isEditMode = true;
            this.selectedId = tx.id;
            this.filteredCategories = this.categories.filter(
               (c) => c.phanLoai === tx.theLoai.phanLoai,
            );
            this.displayAmount = new Intl.NumberFormat('vi-VN').format(tx.tongTien);

            this.txForm.patchValue({
               tenGiaoDich: tx.tenGiaoDich,
               ngayGiaoDich: tx.ngayGiaoDich.substring(0, 10),
               tongTien: tx.tongTien,
               loaiGiaoDich: tx.theLoai.phanLoai,
               theLoaiId: tx.theLoai.id,
               taiKhoanGocId: tx.taiKhoanGoc.id,
               taiKhoanPhuId: tx.taiKhoanPhu?.id || null,
               ghiChu: tx.ghiChu,
            });
         } else {
            this.isEditMode = false;
            this.selectedId = null;
            this.displayAmount = '';
            this.filteredCategories = this.categories.filter((c: any) => c.phanLoai === 'Thu');
            this.txForm.reset({
               ngayGiaoDich: new Date().toISOString().substring(0, 10),
               loaiGiaoDich: 'Thu',
               tongTien: null,
            });
         }
      });

      // Theo dõi đổi Thu/Chi
      this.txForm.get('loaiGiaoDich')?.valueChanges.subscribe((loai) => {
         this.filteredCategories = this.categories.filter((c) => c.phanLoai === loai);
         this.txForm.patchValue({ theLoaiId: null, taiKhoanPhuId: null });
         this.isTransferMode = false;
      });

      // Theo dõi Thể loại để hiện ô Chuyển khoản
      this.txForm.get('theLoaiId')?.valueChanges.subscribe((id) => {
         const selectedCat = this.categories.find((c) => c.id == id);
         const catName = selectedCat?.tenTheLoai?.toLowerCase() || '';
         this.isTransferMode = catName.includes('giữa 2 tài khoản');

         const tkPhuControl = this.txForm.get('taiKhoanPhuId');
         if (this.isTransferMode) {
            tkPhuControl?.setValidators([Validators.required]);
         } else {
            tkPhuControl?.clearValidators();
            tkPhuControl?.setValue(null, { emitEvent: false });
         }
         tkPhuControl?.updateValueAndValidity({ emitEvent: false });
      });

      // Tránh trùng tài khoản
      this.txForm.get('taiKhoanGocId')?.valueChanges.subscribe((gocId) => {
         const phuId = this.txForm.get('taiKhoanPhuId')?.value;
         if (gocId == phuId) this.txForm.get('taiKhoanPhuId')?.setValue(null);
      });
   }

   onAmountInput(value: string): void {
      if (!value) {
         this.displayAmount = '';
         this.txForm.patchValue({ tongTien: null });
         return;
      }
      const rawValue = value.toString().replace(/[^0-9]/g, '');
      const numberValue = parseInt(rawValue, 10);
      if (isNaN(numberValue)) return;
      this.displayAmount = new Intl.NumberFormat('vi-VN').format(numberValue);
      this.txForm.patchValue({ tongTien: numberValue });
   }

   submitForm(): void {
      if (this.txForm.invalid) return;

      const payload = { ...this.txForm.value };
      if (payload.ngayGiaoDich) {
         const selectedDate = new Date(payload.ngayGiaoDich);
         const now = new Date();
         selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
         payload.ngayGiaoDich = selectedDate.toISOString();
      }
      payload.theLoaiId = Number(payload.theLoaiId);
      payload.taiKhoanGocId = Number(payload.taiKhoanGocId);
      if (payload.taiKhoanPhuId) payload.taiKhoanPhuId = Number(payload.taiKhoanPhuId);

      const request = this.isEditMode
         ? this.transactionService.updateTransaction(this.selectedId!, payload)
         : this.transactionService.createTransaction(payload);

      request.subscribe({
         next: (res: any) => {
            if (res && res.success === false) {
               return this.toast.error(res.message);
            }
            this.toast.success(
               this.isEditMode ? 'Cập nhật thành công!' : 'Thêm giao dịch thành công!',
            );
            this.modalService.notifyChange(); // Báo hiệu đã lưu xong
            this.modalService.close(); // Đóng modal
         },
         error: (err) => {
            const msg = err.error?.message || err.message || 'Lỗi hệ thống!';
            this.toast.error(msg);
         },
      });
   }
}
