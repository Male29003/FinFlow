import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatisticService {
   private http = inject(HttpClient);

   getStatByAccount(tuNgay: string, denNgay: string): Observable<any> {
      return this.http.post(`${environment.apiUrl}/thong-ke/byAccount`, { tuNgay, denNgay });
   }

   getStatByTransactionType(tuNgay: string, denNgay: string): Observable<any> {
      return this.http.post(`${environment.apiUrl}/thong-ke/byTransactionType`, {
         tuNgay,
         denNgay,
      });
   }
}
