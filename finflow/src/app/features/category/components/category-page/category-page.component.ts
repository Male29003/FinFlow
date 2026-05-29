import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeService } from '../../service/type.service';
import { Category } from '../../../../shared/models/transaction.model';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ConfirmService } from '../../../../shared/services/confirm.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
   selector: 'app-category-page',
   standalone: true,
   imports: [CommonModule, FormsModule, NgIcon],
   templateUrl: './category-page.component.html',
   styleUrls: ['./category-page.component.scss'],
})
export class CategoryPageComponent implements OnInit {
   private typeService = inject(TypeService);
   private router = inject(Router);
   private toastService = inject(ToastService);
   private confirmService = inject(ConfirmService);

   activeTab: 'Thu' | 'Chi' = 'Chi';
   categories: Category[] = [];
   isLoading = false;
   isProcessing = false;

   isModalOpen = false;
   isEditMode = false;

   selectedItem: Category | null = null;
   formData = { tenTheLoai: '', phanLoai: 'Thu', moTa: '' };

   get filteredCategoriesByTab() {
      if (!this.categories) return [];
      return this.categories.filter((cat) => cat.phanLoai === this.activeTab);
   }

   // tách ra của user và của hệ thống
   get myCategories() {
      if (!this.categories) return [];
      return this.categories.filter((c) => c.phanLoai === this.activeTab && c.userId != null);
   }
   get systemCategories() {
      if (!this.categories) return [];
      return this.categories.filter((c) => c.phanLoai === this.activeTab && c.userId == null);
   }

   parseCategory(name: string) {
      if (!name) return { icon: '🏷️', text: 'Chưa đặt tên' };

      // Regex: tìm Emoji nếu nó nằm ở vị trí đầu tiên của chuỗi
      const startWithEmojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;

      // Xóa khoảng trắng ở đầu trước khi check
      const trimmedName = name.trim();
      const match = trimmedName.match(startWithEmojiRegex);

      if (match) {
         const icon = match[0];
         // Cắt bỏ icon ở đầu đi, phần còn lại laàt tên
         let text = trimmedName.replace(icon, '').trim();
         if (!text) text = 'Danh mục';

         return { icon, text };
      }

      return { icon: '🏷️', text: name.trim() };
   }

   ngOnInit(): void {
      this.loadData();
   }

   loadData(): void {
      this.isLoading = true;
      this.typeService.getAllTypes().subscribe({
         next: (res: any) => {
            this.categories = res.data ? res.data : res;
            this.isLoading = false;
         },
         error: (err) => {
            const msg = err.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            this.toastService.error(msg);
            this.isLoading = false;
         },
      });
   }

   // modal
   openCreate(): void {
      this.isEditMode = false;
      this.selectedItem = null;
      this.formData = { tenTheLoai: '', phanLoai: this.activeTab, moTa: '' };
      this.isModalOpen = true;
   }
   closeModal(): void {
      this.isModalOpen = false;
      this.selectedItem = null;
   }

   openUpdate(item: Category): void {
      if (item.userId == null) return;
      this.isEditMode = true;
      this.selectedItem = item;
      this.formData = {
         tenTheLoai: item.tenTheLoai,
         phanLoai: item.phanLoai,
         moTa: item.moTa || '',
      };
      this.isModalOpen = true;
   }

   submitForm(): void {
      if (!this.formData.tenTheLoai.trim())
         this.toastService.warning('Vui lòng nhập tên thể loại!');
      this.isProcessing = true;
      const payload = { ...this.formData };
      if (!payload.moTa || payload.moTa.trim() === '') payload.moTa = null as any;
      const request = this.isEditMode
         ? this.typeService.updateType(this.selectedItem!.id, payload)
         : this.typeService.createType(payload);

      request.subscribe({
         next: () => {
            this.isModalOpen = false;
            this.isProcessing = false;
            this.toastService.success(this.isEditMode ? 'Cập nhật thành công.' : 'Tạo thành công.');
            this.loadData();
         },
         error: (err) => {
            const msg = err.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            this.isProcessing = false;
            this.toastService.error(msg);
         },
      });
   }

   async handleDelete(id: number) {
      if (!this.selectedItem) return;

      this.isProcessing = true;
      const isConfirmed = await this.confirmService.confirm(
         'Xóa Thể loại',
         'Xóa thể loại này có thể ảnh hưởng đến các giao dịch lịch sử. Hành động này không thể hoàn tác?',
         'Xóa',
         'Hủy',
      );
      if (isConfirmed) {
         this.typeService.deleteType(id).subscribe({
            next: (res: any) => {
               this.isProcessing = false;
               this.closeModal();
               this.toastService.success('Xóa thành công Thể loại.');
               this.categories = [];
               this.loadData();
            },
            error: (err) => {
               const msg = err.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
               this.isProcessing = false;
               this.toastService.error(msg);
            },
         });
      }
   }

   goBack(): void {
      this.router.navigate(['/menu']);
   }
}
