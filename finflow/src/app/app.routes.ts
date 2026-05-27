import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
   // home page
   {
      path: '',
      loadComponent: () =>
         import('./layouts/public-layout/public-layout').then((m) => m.PublicLayoutComponent),
      children: [
         {
            path: '',
            loadComponent: () =>
               import('./features/home/components/home-page/home-page.component').then(
                  (m) => m.HomePageComponent,
               ),
         },
      ],
   },

   // auth route
   {
      path: '',
      loadComponent: () =>
         import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
      canActivate: [guestGuard],
      children: [
         {
            path: '',
            redirectTo: 'login',
            pathMatch: 'full',
         },
         {
            path: 'login',
            loadComponent: () =>
               import('./features/auth/components/login/login.component').then(
                  (m) => m.LoginComponent,
               ),
         },
         {
            path: 'register',
            loadComponent: () =>
               import('./features/auth/components/register/register.component').then(
                  (m) => m.RegisterComponent,
               ),
         },
         {
            path: 'forgot-password',
            loadComponent: () =>
               import('./features/auth/components/forgot-pass/forgot-pass.component').then(
                  (m) => m.ForgotPasswordComponent,
               ),
         },
      ],
   },
   // dashboard route
   {
      path: '',
      loadComponent: () =>
         import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
      canActivate: [authGuard],
      children: [
         {
            path: 'dashboard',
            loadComponent: () =>
               import('./features/dashboard/components/dashboard-page/dashboard-page.component').then(
                  (m) => m.DashboardPageComponent,
               ),
         },
         {
            path: 'transactions',
            loadComponent: () =>
               import('./features/transactions/components/transaction-page/transaction-page.component').then(
                  (m) => m.TransactionPageComponent,
               ),
         },
         {
            path: 'accounts',
            loadComponent: () =>
               import('./features/accounts/components/account-page/account-page.component').then(
                  (m) => m.AccountPageComponent,
               ),
         },
         {
            path: 'account-types',
            loadComponent: () =>
               import('./features/account-types/components/account-type-page/account-type-page.component').then(
                  (m) => m.AccountTypePageComponent,
               ),
         },
         {
            path: 'statistics',
            loadComponent: () =>
               import('./features/statistics/components/statistic-page/statistic-page.component').then(
                  (m) => m.StatisticPageComponent,
               ),
         },
         {
            path: 'category',
            loadComponent: () =>
               import('./features/category/components/category-page/category-page.component').then(
                  (m) => m.CategoryPageComponent,
               ),
         },
         {
            path: 'profile',
            loadComponent: () =>
               import('./features/profile/profile-page/profile-page.component').then(
                  (m) => m.ProfilePageComponent,
               ),
         },
         // cho mobile
         {
            path: 'menu',
            loadComponent: () =>
               import('./features/menu/menu-page/menu-page.component').then(
                  (m) => m.MenuPageComponent,
               ),
         },
         {
            path: 'change-password',
            loadComponent: () =>
               import('./features/auth/components/change-password/change-password.component').then(
                  (m) => m.ChangePasswordComponent,
               ),
         },
      ],
   },
   // error route
];
