import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly API_URL = '/transactions';

  constructor(private http: HttpClient, private authService: AuthService) {}

  buyProduct(productId: number): Observable<Transaction> {
    const userId = this.authService.currentUserValue?.id;
    return this.http.post<Transaction>(`${this.API_URL}/buy/${productId}`, { userId }).pipe(
      tap(() => {
        this.authService.refreshUserBalance().subscribe();
      })
    );
  }

  confirmReception(transactionId: string): Observable<Transaction> {
    const userId = this.authService.currentUserValue?.id;
    return this.http.post<Transaction>(`${this.API_URL}/confirm/${transactionId}`, { userId }).pipe(
      tap(() => {
        this.authService.refreshUserBalance().subscribe();
      })
    );
  }

  getMyTransactions(): Observable<{ purchases: Transaction[], sales: Transaction[] }> {
    const userId = this.authService.currentUserValue?.id;
    return this.http.post<{ purchases: Transaction[], sales: Transaction[] }>(`${this.API_URL}/me`, { userId });
  }

  getFees(): Observable<any> {
    return this.http.get(`${this.API_URL}/fees`);
  }
}
