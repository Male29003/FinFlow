import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalRService } from './core/services/signalr.service';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';

@Component({
   selector: 'app-root',
   imports: [RouterOutlet, ToastComponent, ConfirmModalComponent],
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
