import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (accessToken && refreshToken) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (accessToken && refreshToken) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};