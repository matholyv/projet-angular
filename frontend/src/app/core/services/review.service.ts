import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:3000/reviews';

  constructor(private http: HttpClient) {}

  createReview(data: { reviewerId: string, revieweeId: string, transactionId: string, rating: number, comment: string }): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(this.apiUrl, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getUserReviews(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }
}
