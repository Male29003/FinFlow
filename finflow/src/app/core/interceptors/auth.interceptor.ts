import {
   HttpInterceptorFn,
   HttpRequest,
   HttpHandlerFn,
   HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, catchError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (
   req: HttpRequest<unknown>,
   next: HttpHandlerFn,
) => {
   const authService = inject(AuthService);
   const token = localStorage.getItem('access_token');

   let clonedReq = req;
   if (token) {
      clonedReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
   }

   return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
         // 401 -> Hết hạn token
         if (error.status === 401 && !req.url.includes('auth/login')) {
            // Lấy token mới
            return authService.refreshToken().pipe(
               switchMap((res: any) => {
                  // Có token mới rồi thì lấy gắn vào request cũ và gọi lại
                  const newToken = res.data.accessToken;
                  const retryReq = req.clone({
                     setHeaders: { Authorization: `Bearer ${newToken}` },
                  });
                  return next(retryReq);
               }),
               catchError((err) => {
                  // Refresh token cũng hết hạn nốt -> Ép văng ra trang Login
                  authService.logout();
                  return throwError(() => err);
               }),
            );
         }
         return throwError(() => error);
      }),
   );
};
