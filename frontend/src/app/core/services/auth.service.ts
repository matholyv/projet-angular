import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/auth';
  
  // Suivi de l'état de connexion de l'utilisateur
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Au chargement, on vérifie si un utilisateur était déjà connecté (protection SSR)
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials).pipe(
      tap((response: any) => {
        const userData = { email: credentials.email, ...response };
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        this.currentUserSubject.next(userData);
      })
    );
  }

  logout() {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}

