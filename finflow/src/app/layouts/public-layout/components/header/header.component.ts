import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="home-header">
        <div class="header-container">
            <div class="logo">
                <img src="assets/brand/logo.png" alt="FinFlow Logo" class="logo-img">
            </div>
            <nav>
                <a routerLink="/login" class="btn-link">Đăng nhập</a>
                <a routerLink="/register" class="btn-primary">Đăng ký</a>
            </nav>
        </div>
    </header>
  `,
    styleUrls: ["./header.component.scss"]
})
export class HomeHeaderComponent {}