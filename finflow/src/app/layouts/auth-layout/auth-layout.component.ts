import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout-wrapper">
      <div class="bg-glow top-left"></div>
      <div class="bg-glow bottom-right"></div>
      <div class="auth-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent {}