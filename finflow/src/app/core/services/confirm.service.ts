import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface ConfirmState {
   show: boolean;
   title: string;
   message: string;
   confirmText?: string;
   cancelText?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
   private state = new Subject<ConfirmState>();
   state$ = this.state.asObservable();

   private resolveFn?: (val: boolean) => void;

   confirm(
      title: string,
      message: string,
      confirmText = 'Xác nhận',
      cancelText = 'Hủy',
   ): Promise<boolean> {
      this.state.next({ show: true, title, message, confirmText, cancelText });

      return new Promise((resolve) => {
         this.resolveFn = resolve;
      });
   }

   respond(result: boolean) {
      this.state.next({ show: false, title: '', message: '' }); // Đóng modal
      if (this.resolveFn) {
         this.resolveFn(result);
         this.resolveFn = undefined;
      }
   }
}
