import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
   private currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('user') || 'null'),
   );
   public currentUser$ = this.currentUserSubject.asObservable();
   private apiUrl = `${environment.apiUrl}/auth`;

   constructor(
      private http: HttpClient,
      private router: Router,
   ) {}

   register(data: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/register`, data);
   }

   login(credentials: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
         tap((response: any) => {
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            this.currentUserSubject.next(response.data.user);
         }),
      );
   }

   refreshToken(): Observable<any> {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      return this.http
         .post(
            `${this.apiUrl}/refresh-token`,
            {},
            { headers: { Authorization: `Bearer ${refreshTokenValue}` } },
         )
         .pipe(
            tap((response: any) => {
               localStorage.setItem('access_token', response.data.accessToken);
               localStorage.setItem('refresh_token', response.data.refreshToken);
            }),
         );
   }

   clearUser(): void {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      this.currentUserSubject.next(null);
   }

   logout(): void {
      this.clearUser();
      this.router.navigate(['/']);
   }

   changePassword(payload: any) {
      return this.http.post(`${this.apiUrl}/update-user`, payload);
   }

   sendOtp(email: string, purpose: 'ForgotPassword' | 'Register' | 'ChangePassword') {
      return this.http.post(`${this.apiUrl}/send-otp`, { email, purpose });
   }

   verifyOtp(
      email: string,
      otpCode: string,
      purpose: 'ForgotPassword' | 'Register' | 'ChangePassword',
   ) {
      return this.http.post(`${this.apiUrl}/verify-otp`, { email, otpCode, purpose });
   }

   resetPasswordWithOtp(payload: any) {
      return this.http.post(`${this.apiUrl}/reset-password`, payload);
   }
}
