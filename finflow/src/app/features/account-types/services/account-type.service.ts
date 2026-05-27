
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedResult } from '../../../shared/models/common.model';
import { AccountType } from '../../../shared/models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/account-types`;

  getAccountTypes(page: number = 1, size: number = 10, keyword: string = ''): Observable<PagedResult<AccountType>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<PagedResult<AccountType>>(this.apiUrl, { params });
  }

  getAllAccountTypes(): Observable<AccountType[]> {
    return this.http.get<AccountType[]>(this.apiUrl);
  }

  createAccountType(data: { Ten: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateAccountType(id: number, data: { ten: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteAccountType(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}