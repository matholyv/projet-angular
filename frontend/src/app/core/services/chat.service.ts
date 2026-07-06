import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Injector } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = '/chat';
  private socket: Socket;
  public newMessage$ = new Subject<any>();

  private unreadMap: { [key: string]: number } = {};
  public unreadCountsSubject = new BehaviorSubject<{ [key: string]: number }>({});
  public unreadCounts$ = this.unreadCountsSubject.asObservable();
  
  private activeConvoKey: string | null = null;

  constructor(private http: HttpClient, private injector: Injector) {
    this.socket = io();

    // Restaurer la carte des messages non lus depuis le localStorage au chargement
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('unread_messages_map');
      if (saved) {
        try {
          this.unreadMap = JSON.parse(saved);
          this.unreadCountsSubject.next({ ...this.unreadMap });
        } catch (e) {
          this.unreadMap = {};
        }
      }
    }
    
    this.socket.on('newMessage', (message: any) => {
      this.newMessage$.next(message);

      // Gestion des compteurs de messages non lus
      if (typeof window !== 'undefined' && window.localStorage) {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          const user = JSON.parse(userStr);
          const currentUserId = user.id || user.userId || user.sub;
          
          // Si le message est reçu de quelqu'un d'autre
          if (message && String(message.sender_id) !== String(currentUserId)) {
            const key = `${message.ad_id}_${message.sender_id}`;
            // Si cette conversation n'est pas activement ouverte à l'écran, on l'incrémente
            if (key !== this.activeConvoKey) {
              this.incrementUnread(String(message.ad_id), String(message.sender_id));
            }
          }
        }
      }
    });

    this.socket.on('balanceUpdated', () => {
      // Eviter dépendance circulaire en récupérant AuthService via l'injecteur
      const authService = this.injector.get(AuthService);
      authService.refreshUserBalance().subscribe();
    });
  }

  identify(userId: string) {
    this.socket.emit('identify', userId);
  }

  setActiveConversation(adId: string | null, partnerId: string | null) {
    if (adId && partnerId) {
      this.activeConvoKey = `${adId}_${partnerId}`;
      this.markAsRead(adId, partnerId);
    } else {
      this.activeConvoKey = null;
    }
  }

  incrementUnread(adId: string, partnerId: string) {
    const key = `${adId}_${partnerId}`;
    this.unreadMap[key] = (this.unreadMap[key] || 0) + 1;
    this.saveAndEmit();
  }

  markAsRead(adId: string, partnerId: string) {
    const key = `${adId}_${partnerId}`;
    if (this.unreadMap[key] && this.unreadMap[key] > 0) {
      this.unreadMap[key] = 0;
      this.saveAndEmit();
    }
  }

  private saveAndEmit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('unread_messages_map', JSON.stringify(this.unreadMap));
    }
    this.unreadCountsSubject.next({ ...this.unreadMap });
  }

  getInbox(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inbox?userId=${userId}`);
  }

  getConversation(adId: string, user1: string, user2: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?adId=${adId}&user1=${user1}&user2=${user2}`);
  }

  sendMessage(messageData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, messageData);
  }
}
