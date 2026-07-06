import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, delay } from 'rxjs'; // Ajout de retry ! ✨

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private API_URL = '/products';

  constructor(private http: HttpClient) {}

  getAds(filters?: any): Observable<any[]> {
    let params = {};
    if (filters) {
      // On crée un nouvel objet propre avec uniquement les champs remplis
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          params = { ...params, [key]: filters[key] };
        }
      });
    }

    return this.http.get<any[]>(this.API_URL, { params }).pipe(
      retry({ count: 2, delay: 500 })
    );
  }

  getAdById(id: any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }

  createAd(adData: any): Observable<any> {
    return this.http.post(this.API_URL, adData);
  }

  deleteAd(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
