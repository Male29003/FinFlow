import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Lấy trạng thái ban đầu từ localStorage (mặc định là true nếu chưa có)
  private getInitialState(): boolean {
    const savedState = localStorage.getItem('sidebarExpanded');
    return savedState !== 'false'; // Trả về false chỉ khi user đã cố tình lưu 'false'
  }

  private sidebarState = new BehaviorSubject<boolean>(this.getInitialState());
  
  // Biến này để các component khác subscribe vào
  isSidebarExpanded$ = this.sidebarState.asObservable();

  // Hàm đảo ngược trạng thái
  toggleSidebar() {
    const newState = !this.sidebarState.value;
    this.sidebarState.next(newState);
    localStorage.setItem('sidebarExpanded', String(newState));
  }

  // Hàm set cứng trạng thái (Dùng khi responsive)
  setSidebarState(isExpanded: boolean) {
    if (this.sidebarState.value !== isExpanded) {
      this.sidebarState.next(isExpanded);
      localStorage.setItem('sidebarExpanded', String(isExpanded));
    }
  }
}