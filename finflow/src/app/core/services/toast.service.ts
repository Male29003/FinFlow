import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
   id: number;
   message: string;
   type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
   private toastsSubject = new BehaviorSubject<Toast[]>([]);
   toasts$ = this.toastsSubject.asObservable();
   private counter = 0;

   show(message: string, type: Toast['type'] = 'info') {
      const id = this.counter++;
      const toast: Toast = { id, message, type };
      this.toastsSubject.next([...this.toastsSubject.value, toast]);

      setTimeout(() => this.remove(id), 3000);
   }

   remove(id: number) {
      this.toastsSubject.next(this.toastsSubject.value.filter((t) => t.id !== id));
   }

   success(msg: string) {
      this.show(msg, 'success');
   }
   error(msg: string) {
      this.show(msg, 'error');
   }
   warning(msg: string) {
      this.show(msg, 'warning');
   }
}
