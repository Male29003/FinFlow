import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TypeService {
   private http = inject(HttpClient);
   private apiUrl = `${environment.apiUrl}/types`;

   getAllTypes(): Observable<any> {
      return this.http.get(this.apiUrl);
   }

   createType(data: any): Observable<any> {
      return this.http.post(this.apiUrl, data);
   }

   updateType(id: number, data: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/${id}`, data);
   }

   deleteType(id: number): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${id}`);
   }
}
