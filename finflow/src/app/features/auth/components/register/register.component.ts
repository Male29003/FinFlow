import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-register',
   standalone: true,
   imports: [ReactiveFormsModule, CommonModule, RouterLink, NgIcon],
   templateUrl: './register.component.html',
   styleUrls: ['../auth.component.scss', './register.component.scss'],
})
export class RegisterComponent {
   private fb = inject(FormBuilder);
   private router = inject(Router);
   private authService = inject(AuthService);

   registerForm: FormGroup = this.fb.group({
      name: ['', Validators.required],
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
   });

   isLoading = false;
   errorMessage = '';
   showPwd = false;
   previewUrl = '';
   private debounceTimer: any;

   onNameInput(): void {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
         const name = this.registerForm.get('name')?.value?.trim();
         this.previewUrl = name
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=185fa5&color=fff&size=80&bold=true&rounded=true`
            : '';
      }, 400);
   }

   onSubmit(): void {
      if (this.registerForm.invalid) return;
      this.isLoading = true;
      this.errorMessage = '';

      const name = this.registerForm.get('name')?.value?.trim();
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=185fa5&color=fff&size=128&bold=true&rounded=true`;

      const payload = {
         ...this.registerForm.value,
         avatarUrl,
      };

      this.authService.register(payload).subscribe({
         next: () => {
            this.router.navigate(['/login'], {
               queryParams: { registered: 'true' },
            });
         },
         error: (err) => {
            this.errorMessage = err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            this.isLoading = false;
         },
      });
   }
}
