import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface AdminStats {
  totalUsers: number;
  totalAds: number;
  totalSales: number;
  totalRevenue: number;
}

export interface AdminUser {
  id: string;
  email: string;
  pseudo: string;
  role: string;
  credits: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  private getUserId() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const u = JSON.parse(userStr);
      return u.id || u.userId || u.sub;
    }
    return '';
  }

  getStats(): Observable<AdminStats> {
    return this.http.post<AdminStats>(`${this.apiUrl}/stats`, { userId: this.getUserId() });
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.post<AdminUser[]>(`${this.apiUrl}/users`, { userId: this.getUserId() });
  }

  updateCredits(userId: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/credits`, { amount, userId: this.getUserId() });
  }

  getSettings(): Observable<any> {
    return this.http.post(`${this.apiUrl}/settings`, { userId: this.getUserId() });
  }

  updateSettings(feePercentage: number, feeFixed: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/settings/update`, {
      userId: this.getUserId(),
      feePercentage,
      feeFixed
    });
  }
}
