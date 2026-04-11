import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // L'URL de votre serveur NestJS (Phase 1)
  private readonly API_URL = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  /**
   * Envoi d'une requête POST à NestJS pour créer un compte dans MySQL
   */
  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  /**
   * Envoi d'une requête POST à NestJS pour se connecter et récupérer le JWT
   */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }
}
