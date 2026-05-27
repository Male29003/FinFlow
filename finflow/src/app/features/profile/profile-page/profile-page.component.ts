import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-profile-page',
   standalone: true,
   imports: [CommonModule, RouterLink, ReactiveFormsModule, NgIcon],
   templateUrl: './profile-page.component.html',
   styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
   private fb = inject(FormBuilder);
   private router = inject(Router);
   private authService = inject(AuthService);

   profileForm: FormGroup = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
   });

   avatarUrl = '';
   isSaving = false;
   successMessage = '';
   errorMessage = '';

   ngOnInit(): void {
      const stored = localStorage.getItem('user');
      if (stored) {
         const user = JSON.parse(stored);
         const name = user.hoTen || user.name || '';
         const email = user.email || user.username || '';
         this.profileForm.patchValue({ name, email });
         this.avatarUrl = this.buildAvatarUrl(name);
      }

      // Rebuild avatar when name changes
      this.profileForm.get('name')?.valueChanges.subscribe((name) => {
         if (name?.trim()) {
            this.avatarUrl = this.buildAvatarUrl(name.trim());
         }
      });
   }

   private buildAvatarUrl(name: string): string {
      const encoded = encodeURIComponent(name);
      return `https://ui-avatars.com/api/?name=${encoded}&background=185fa5&color=fff&size=128&bold=true&rounded=true`;
   }

   onSave(): void {
      if (this.profileForm.invalid) return;
      this.isSaving = true;
      this.successMessage = '';
      this.errorMessage = '';

      setTimeout(() => {
         const stored = localStorage.getItem('user');
         if (stored) {
            const user = JSON.parse(stored);
            user.hoTen = this.profileForm.get('name')?.value;
            user.name = user.hoTen;
            localStorage.setItem('user', JSON.stringify(user));
            this.authService['currentUserSubject'].next(user);
         }
         this.isSaving = false;
         this.successMessage = 'Cập nhật hồ sơ thành công!';
         setTimeout(() => (this.successMessage = ''), 3000);
      }, 600);
   }

   goBack(): void {
      this.router.navigate(['/menu']);
   }
}
