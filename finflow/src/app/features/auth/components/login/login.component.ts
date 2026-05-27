import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { NgIcon } from '@ng-icons/core';

@Component({
   selector: 'app-login',
   standalone: true,
   imports: [ReactiveFormsModule, CommonModule, RouterLink, NgIcon],
   templateUrl: './login.component.html',
   styleUrls: ['../auth.component.scss', './login.component.scss'],
})
export class LoginComponent implements OnInit {
   private fb = inject(FormBuilder);
   private router = inject(Router);
   private route = inject(ActivatedRoute);
   private authService = inject(AuthService);

   loginForm: FormGroup = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
   });

   isLoading = false;
   errorMessage = '';
   showPwd = false;
   showRegisteredMsg = false;

   ngOnInit(): void {
      this.route.queryParams.subscribe((params) => {
         this.showRegisteredMsg = params['registered'] === 'true';
      });
   }

   onSubmit(): void {
      if (this.loginForm.invalid) return;
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
         next: () => {
            this.router.navigate(['/dashboard']);
         },
         error: (err) => {
            this.errorMessage = err.error?.message || 'Email hoặc mật khẩu không đúng.';
            this.isLoading = false;
         },
      });
   }
}
