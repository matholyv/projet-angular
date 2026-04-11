import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  // TODO: Remplacer par un vrai AuthService lors de l'intégration avec le Backend
  private isAuthenticated = false;

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.isAuthenticated) {
      return true;
    }
    
    // Redirige vers la page de login si non connecté
    // Optionnel : on pourrait afficher un message d'alerte ici
    return this.router.parseUrl('/login');
  }
}
