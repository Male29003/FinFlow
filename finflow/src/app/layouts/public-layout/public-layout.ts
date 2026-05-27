import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeHeaderComponent } from './components/header/header.component';
import { HomeFooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, HomeHeaderComponent, HomeFooterComponent],
  template: `
    <app-home-header></app-home-header>
    <router-outlet></router-outlet>
    <app-home-footer></app-home-footer>
  `,
  styleUrls: ["./public-layout.scss"]
})

export class PublicLayoutComponent {}