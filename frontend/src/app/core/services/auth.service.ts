import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/auth';
  
  // Suivi de l'état de connexion de l'utilisateur
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

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

  refreshUserBalance(): Observable<any> {
    const userId = this.currentUserSubject.value?.id;
    if (!userId) {
      return new Observable(sub => {
        sub.error("Aucun utilisateur connecté");
        sub.complete();
      });
    }
    return this.http.get(`${this.API_URL}/user/${userId}`).pipe(
      tap((userProfile: any) => {
        const currentUserData = this.currentUserSubject.value;
        if (currentUserData && userProfile) {
          currentUserData.credits = userProfile.credits;
          currentUserData.pending_credits = userProfile.pending_credits;
          if (userProfile.role) {
            currentUserData.role = userProfile.role;
          }
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            localStorage.setItem('currentUser', JSON.stringify(currentUserData));
          }
          this.currentUserSubject.next({ ...currentUserData });
        }
      })
    );
  }

  refill(amount: number): Observable<any> {
    const userId = this.currentUserSubject.value?.id;
    if (!userId) {
      return new Observable(sub => {
        sub.error("Aucun utilisateur connecté");
        sub.complete();
      });
    }
    return this.http.post(`${this.API_URL}/refill`, { userId, amount }).pipe(
      tap((updatedUser: any) => {
        const currentUserData = this.currentUserSubject.value;
        if (currentUserData && updatedUser) {
          currentUserData.credits = updatedUser.credits;
          currentUserData.pending_credits = updatedUser.pending_credits;
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            localStorage.setItem('currentUser', JSON.stringify(currentUserData));
          }
          this.currentUserSubject.next({ ...currentUserData });
        }
      })
    );
  }

  getPublicProfile(userId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/public/${userId}`);
  }

  updateDescription(userId: string, description: string): Observable<any> {
    return this.http.post(`${this.API_URL}/user/${userId}/description`, { description }).pipe(
      tap((updatedUser: any) => {
        const currentUserData = this.currentUserSubject.value;
        if (currentUserData && updatedUser) {
          currentUserData.description = updatedUser.description;
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            localStorage.setItem('currentUser', JSON.stringify(currentUserData));
          }
          this.currentUserSubject.next({ ...currentUserData });
        }
      })
    );
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}

