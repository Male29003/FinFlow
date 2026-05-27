import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

// Ktra trùng khớp mk chưa
const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
   const pwd = group.get('password')?.value;
   const confirm = group.get('confirmPassword')?.value;
   return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
};

@Component({
   selector: 'app-forgot-password',
   standalone: true,
   imports: [CommonModule, RouterLink, ReactiveFormsModule, NgIcon],
   templateUrl: './forgot-pass.component.html',
   styleUrls: ['../auth.component.scss', './forgot-pass.component.scss'],
})
export class ForgotPasswordComponent implements OnDestroy {
   private fb = inject(FormBuilder);
   private authService = inject(AuthService);

   // 1 -> gửi email,
   // 2 -> nhập OTP,
   // -> xác thực thành công -> 3 -> nhập mk mới,
   // 4 -> xác nhận thành công
   step = 1;
   isLoading = false;
   errorMessage = '';
   resendCountdown = 0;
   isOtpComplete = false;
   showPwd = false;
   showConfirm = false;

   private otpValue = '';
   private countdownTimer: any;
   private readonly DEMO_OTP = '123456';

   emailForm: FormGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
   });

   otpForm: FormGroup = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
   });

   resetForm: FormGroup = this.fb.group(
      {
         password: ['', [Validators.required, Validators.minLength(6)]],
         confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator },
   );

   // Nhập email -> Gửi otp
   onSendOtp(): void {
      if (this.emailForm.invalid) return;
      this.isLoading = true;
      this.errorMessage = '';

      const email = this.emailForm.value.email;
      this.authService.sendOtp(email, 'ForgotPassword').subscribe({
         next: () => {
            this.isLoading = false;
            this.step = 2;
            this.startResendCountdown(60);
         },
         error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.error?.message || 'Lỗi! Vui lòng thử lại!';
         },
      });
   }

   // Nhập OTP
   onOtpInput(event: KeyboardEvent, index: number): void {
      const input = event.target as HTMLInputElement;
      const value = input.value;

      if (value && index < 5) {
         const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
         next?.focus();
      }
      this.collectOtp();
   }

   onOtpKeydown(event: KeyboardEvent, index: number): void {
      const input = event.target as HTMLInputElement;
      if (event.key === 'Backspace' && !input.value && index > 0) {
         const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
         prev?.focus();
      }
   }

   onOtpPaste(event: ClipboardEvent): void {
      event.preventDefault();
      const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ?? '';
      pasted.split('').forEach((char, i) => {
         const box = document.getElementById(`otp-${i}`) as HTMLInputElement;
         if (box) box.value = char;
      });
      this.collectOtp();
      const lastFilled = Math.min(pasted.length, 5);
      (document.getElementById(`otp-${lastFilled}`) as HTMLInputElement)?.focus();
   }

   private collectOtp(): void {
      let val = '';
      for (let i = 0; i < 6; i++) {
         val += (document.getElementById(`otp-${i}`) as HTMLInputElement)?.value || '';
      }
      this.otpValue = val;
      this.isOtpComplete = val.length === 6;
   }

   // xác thực otp
   onVerifyOtp(): void {
      if (!this.isOtpComplete) return;
      this.isLoading = true;
      this.errorMessage = '';

      const email = this.emailForm.value.email;
      const otp = this.otpValue;

      this.authService.verifyOtp(email, otp, 'ForgotPassword').subscribe({
         next: (res: any) => {
            this.isLoading = false;
            this.step = 3;
         },
         error: (err) => {
            this.isLoading = false;
            const msg = err.error.message || 'Lỗi! Không thể xác thực OTP. Vui lòng thử lại!';
            this.errorMessage = msg;
         },
      });
   }

   // gửi lại otp
   onResendOtp(): void {
      this.errorMessage = '';
      this.startResendCountdown(60);

      this.authService.sendOtp(this.emailForm.value.email, 'ForgotPassword').subscribe({
         error: (err) => {
            this.errorMessage = err.error?.message || 'Không thể gửi lại mã OTP.';
         },
      });
   }

   private startResendCountdown(seconds: number): void {
      this.resendCountdown = seconds;
      clearInterval(this.countdownTimer);
      this.countdownTimer = setInterval(() => {
         this.resendCountdown--;
         if (this.resendCountdown <= 0) clearInterval(this.countdownTimer);
      }, 1000);
   }

   // Nhập password mới
   onResetPassword(): void {
      if (this.resetForm.invalid) return;
      this.isLoading = true;
      this.errorMessage = '';

      const payload = {
         email: this.emailForm.value.email,
         otpCode: this.otpValue,
         newPassword: this.resetForm.value.password,
      };

      this.authService.resetPasswordWithOtp(payload).subscribe({
         next: () => {
            this.isLoading = false;
            this.step = 4;
         },
         error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.error?.message || 'Mã OTP không đúng hoặc đã hết hạn.';

            if (this.errorMessage.toLowerCase().includes('otp')) {
               this.step = 2;
            }
         },
      });
   }

   ngOnDestroy(): void {
      clearInterval(this.countdownTimer);
   }
}
