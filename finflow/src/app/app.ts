import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalRService } from './core/services/signalr.service';

@Component({
   selector: 'app-root',
   imports: [RouterOutlet],
   templateUrl: './app.html',
   styleUrl: './app.scss',
})
export class App {
   protected readonly title = signal('finflow');
   private signalRService = inject(SignalRService);

   ngOnInit() {
      this.signalRService.startConnection();
   }
}
