
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Account } from '../../../shared/models/account.model';
import { PagedResult } from '../../../shared/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/accounts`;

  getAccounts(page: number = 1, size: number = 10, keyword: string = ''): Observable<PagedResult<Account>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<PagedResult<Account>>(this.apiUrl, { params });
  }

  getAllAccounts(): Observable<Account[]> {
    const params = new HttpParams().set('page', 1).set('size', 999);
    return this.http.get<PagedResult<Account>>(this.apiUrl, { params }).pipe(
      map(res => res.data ?? [])
    );
  }

  createAccount(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateAccount(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteAccount(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  linkBank(data: { tenNganHang: string, soTaiKhoan: string, isDemo: boolean }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/bank-integration/link`, data);
  }
}