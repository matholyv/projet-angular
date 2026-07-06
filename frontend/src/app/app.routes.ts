import { Routes } from '@angular/router';

// Imports des composants
import { AdSearchComponent } from './features/ads/ad-search/ad-search';
import { AdDetailComponent } from './features/ads/ad-detail/ad-detail';
import { AdFormComponent } from './features/ads/ad-form/ad-form';
import { FavoritesComponent } from './features/ads/favorites/favorites';
import { ChatComponent } from './features/chat/chat';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard';
import { ProfileComponent } from './features/profile/profile';
import { PublicProfileComponent } from './features/profile/public-profile/public-profile';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Page d'accueil -> Redirige vers la recherche
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  
  // Authentification
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Annonces & Recherche
  { path: 'search', component: AdSearchComponent },
  { path: 'ad/:id', component: AdDetailComponent },
  {
    path: 'transaction/:id',
    loadComponent: () => import('./features/transactions/transaction-detail/transaction-detail').then(m => m.TransactionDetailComponent)
  },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'publish', component: AdFormComponent, canActivate: [AuthGuard] },
  
  // Messagerie
  { path: 'messages', component: ChatComponent, canActivate: [AuthGuard] },
  
  // Profil
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'user/:id', component: PublicProfileComponent },
  
  // Administration (Logiquement on rajoutera un AdminGuard plus tard)
  { path: 'admin', component: AdminDashboardComponent },
  
  // Fallback (Erreur 404)
  { path: '**', redirectTo: 'search' }
];
