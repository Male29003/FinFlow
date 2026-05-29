import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
   AbstractControl,
   FormBuilder,
   FormGroup,
   ReactiveFormsModule,
   ValidationErrors,
   ValidatorFn,
   Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { NgIcon } from '@ng-icons/core';
import { ConfirmService } from '../../../../shared/services/confirm.service';
import { ToastService } from '../../../../shared/services/toast.service';
const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
   const p = group.get('newPassword')?.value;
   const c = group.get('confirmPassword')?.value;
   return p && c && p !== c ? { mismatch: true } : null;
};

@Component({
   selector: 'app-change-password',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, NgIcon],
   templateUrl: './change-password.component.html',
   styleUrls: ['../auth.component.scss', './change-password.component.scss'],
})
export class ChangePasswordComponent {
   private fb = inject(FormBuilder);
   private authService = inject(AuthService);
   private router = inject(Router);
   private confirmService = inject(ConfirmService);

   showCurrent = false;
   showNew = false;
   showConfirm = false;
   isLoading = false;
   successMessage = '';
   errorMessage = '';

   changeForm: FormGroup = this.fb.group(
      {
         currentPassword: ['', Validators.required],
         newPassword: ['', [Validators.required, Validators.minLength(6)]],
         confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator },
   );

   get pwdStrength(): { percent: number; cls: string; label: string } {
      const pwd: string = this.changeForm.get('newPassword')?.value ?? '';
      if (!pwd) return { percent: 0, cls: '', label: '' };
      let score = 0;
      if (pwd.length >= 6) score++;
      if (pwd.length >= 10) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;
      if (score <= 1) return { percent: 25, cls: 'weak', label: 'Yếu' };
      if (score <= 2) return { percent: 50, cls: 'fair', label: 'Trung bình' };
      if (score <= 3) return { percent: 75, cls: 'good', label: 'Tốt' };
      return { percent: 100, cls: 'strong', label: 'Rất mạnh' };
   }

   async goToForgotPassword() {
      const isConfirmed = await this.confirmService.confirm(
         'Xác nhận đăng xuất',
         'Bạn sẽ phải đăng xuất để khôi phục mật khẩu. Bạn có muốn tiếp tục?',
         'OK',
         'Hủy',
         'warning',
      );
      if (isConfirmed) {
         this.authService.clearUser();
         this.router.navigate(['/forgot-password']);
      }
   }

   onSubmit(): void {
      if (this.changeForm.invalid) return;
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      const payload = {
         userId: currentUser.id || currentUser.Id,
         name: currentUser.name || currentUser.Name,
         oldPassword: this.changeForm.get('currentPassword')?.value,
         newPassword: this.changeForm.get('newPassword')?.value,
      };

      this.authService.changePassword(payload).subscribe({
         next: () => {
            this.isLoading = false;
            this.successMessage = 'Mật khẩu đã được cập nhật thành công!';
            this.changeForm.reset();
            setTimeout(() => (this.successMessage = ''), 4000);
            this.router.navigate(['/dashboard']);
         },
         error: (err) => {
            this.isLoading = false;
            this.errorMessage =
               err.error?.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.';
         },
      });
   }
}
