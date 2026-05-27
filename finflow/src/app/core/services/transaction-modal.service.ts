import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Transaction } from '../../shared/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionModalService {
   private isOpenSubject = new BehaviorSubject<boolean>(false);
   isOpen$ = this.isOpenSubject.asObservable();

   private txDataSubject = new BehaviorSubject<Transaction | null>(null);
   txToEdit$ = this.txDataSubject.asObservable();

   private changedSubject = new Subject<void>();
   transactionChanged$ = this.changedSubject.asObservable();

   open(tx?: Transaction) {
      this.txDataSubject.next(tx || null);
      this.isOpenSubject.next(true);
   }

   close() {
      this.isOpenSubject.next(false);
      this.txDataSubject.next(null);
   }

   notifyChange() {
      this.changedSubject.next();
   }
}
