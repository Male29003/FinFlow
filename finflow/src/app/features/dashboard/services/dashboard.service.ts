import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Transaction } from '../../../shared/models/transaction.model';
import { PagedResult } from '../../../shared/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/transactions`;

  getTransactions(page: number = 1, size: number = 10, keyword?: string): Observable<PagedResult<Transaction>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword) 
      params = params.set('keyword', keyword);

    const response = this.http.get<PagedResult<Transaction>>(this.apiUrl, { params });
    console.log(response)
    return response;
  }

  createTransaction(payload: any): Observable<any> {
    const response = this.http.post(this.apiUrl, payload);
    console.log(response)
    return response
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}