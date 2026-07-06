import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Notification {
  id: number;
  userId: string | null;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private readonly API_URL = '/api/notifications';
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private pollingSub?: Subscription;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.id) {
        this.startPolling(user.id);
      } else {
        this.stopPolling();
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
      }
    });
  }

  private startPolling(userId: string) {
    this.stopPolling();
    // Poll every 10 seconds for real-time updates
    this.pollingSub = timer(0, 10000).pipe(
      switchMap(() => this.http.get<Notification[]>(`${this.API_URL}/${userId}`))
    ).subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        const unread = notifications.filter(n => !n.isRead).length;
        this.unreadCountSubject.next(unread);
      },
      error: (err) => console.error('Erreur lors de la récupération des notifications', err)
    });
  }

  private stopPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }

  markAsRead(notificationId: number): Observable<any> {
    const userId = this.authService.currentUserValue?.id;
    return this.http.post(`${this.API_URL}/${notificationId}/read`, { userId }).pipe(
      tap(() => {
        // Update local state immediately for snappy UI
        const current = this.notificationsSubject.value;
        const updated = current.map(n => {
          if (n.id === notificationId) {
            return { ...n, isRead: true };
          }
          return n;
        });
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(updated.filter(n => !n.isRead).length);
      })
    );
  }

  markAllAsRead(): Observable<any> {
    const userId = this.authService.currentUserValue?.id;
    return this.http.post(`${this.API_URL}/read-all`, { userId }).pipe(
      tap(() => {
        const current = this.notificationsSubject.value;
        const updated = current.map(n => ({ ...n, isRead: true }));
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(0);
      })
    );
  }
  
  ngOnDestroy() {
    this.stopPolling();
  }
}
