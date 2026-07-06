import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdCardComponent } from '../../../shared/components/ad-card/ad-card';
import { AdService } from '../../../core/services/ad.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, AdCardComponent],
  template: `
    <div class="page-container container fade-in">
      <h1 class="main-title">Mes Favoris ❤️</h1>
      
      <div *ngIf="isLoading" class="loading-state">
        <p>Chargement de vos coups de coeur...</p>
      </div>

      <div *ngIf="!isLoading && favoriteAds.length === 0" class="empty-state">
        <h2>Aucun favori pour le moment</h2>
        <p>Vous n'avez oublié de liker vos pièces coup de cœur !</p>
        <button class="primary-violet" routerLink="/search"> Explorer les annonces </button>
      </div>

      <div class="results-grid" *ngIf="!isLoading && favoriteAds.length > 0">
        <app-ad-card 
          *ngFor="let ad of favoriteAds"
          [id]="ad.id"
          [title]="ad.title"
          [price]="ad.price"
          [imageUrl]="ad.imageUrl"
          [condition]="ad.condition"
          [size]="ad.size"
          [authorPseudo]="ad.authorPseudo"
        ></app-ad-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 40px 20px;
      min-height: 80vh;
      max-width: 1200px;
      margin: 0 auto;
    }
    .main-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 30px;
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
    .empty-state, .loading-state {
      text-align: center;
      padding: 60px 20px;
      background: var(--bg-card);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
    }
    .empty-state h2 {
      font-size: 20px;
      color: var(--text-main);
      margin-bottom: 10px;
    }
    .empty-state p {
      color: var(--text-muted);
      margin-bottom: 25px;
    }
    .primary-violet {
      background-color: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      padding: 0.6rem 1.4rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .primary-violet:hover {
      background-color: var(--primary-hover);
    }
  `]
})
export class FavoritesComponent implements OnInit {
  favoriteAds: any[] = [];
  isLoading = true;

  constructor(private adService: AdService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    const favIds: number[] = JSON.parse(localStorage.getItem('2ndmain_favorites') || '[]');
    
    if (favIds.length === 0) {
      this.isLoading = false;
      return;
    }

    // On récupère toutes les annonces et on filtre (Méthode rapide) 🚀
    this.adService.getAds({}).subscribe({
      next: (ads) => {
        // Filtrage des favoris
        const filtered = ads.filter((ad: any) => favIds.includes(ad.id));
        
        this.favoriteAds = filtered.map((ad: any) => {
          let finalImageUrl = ad.image_data || '';
          if (finalImageUrl.startsWith('["')) {
            try {
              const images = JSON.parse(finalImageUrl);
              finalImageUrl = images[0] || '';
            } catch (e) {
              finalImageUrl = finalImageUrl.replace(/\["|"]/g, '');
            }
          }

          return {
            ...ad,
            imageUrl: finalImageUrl,
            authorPseudo: ad.owner?.pseudo || 'Vendeur'
          };
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur chargement favoris", err);
        this.isLoading = false;
      }
    });
  }
}
