import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Transaction } from '../../../shared/models/transaction.model';
import { PagedResult } from '../../../shared/models/common.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
   private http = inject(HttpClient);
   private apiUrl = `${environment.apiUrl}/transactions`;

   getTransactions(
      page: number = 1,
      size: number = 10,
      keyword: string = '',
      maTaiKhoan: string = '',
      phanLoai: string = '',
   ): Observable<PagedResult<Transaction>> {
      let params = new HttpParams().set('page', page).set('size', size);
      if (keyword) params = params.set('keyword', keyword);
      if (maTaiKhoan) params = params.set('maTaiKhoan', maTaiKhoan);
      if (phanLoai) params = params.set('phanLoai', phanLoai);
      return this.http.get<PagedResult<Transaction>>(this.apiUrl, { params });
   }

   getTransactionsByDateRange(
      page: number,
      size: number,
      tuNgay: string,
      denNgay: string,
   ): Observable<PagedResult<Transaction>> {
      let params = new HttpParams()
         .set('page', page)
         .set('size', size)
         .set('TuNgay', tuNgay)
         .set('DenNgay', denNgay);
      return this.http.get<PagedResult<Transaction>>(`${this.apiUrl}/by-date-range`, { params });
   }

   createTransaction(data: any): Observable<any> {
      const response = this.http.post(this.apiUrl, data);
      console.log(response);
      return response;
   }

   updateTransaction(id: number, data: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/${id}`, data);
   }

   deleteTransaction(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${id}`);
   }
}
