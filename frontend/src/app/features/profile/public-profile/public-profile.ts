import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdService } from '../../../core/services/ad.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.css'
})
export class PublicProfileComponent implements OnInit {
  userId: string | null = null;
  publicProfile: any = null;
  userAds: any[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private adService: AdService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      if (this.userId) {
        this.loadProfileData();
      }
    });
  }

  loadProfileData() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    // Charger le profil public
    this.authService.getPublicProfile(this.userId!).subscribe({
      next: (profile) => {
        this.publicProfile = profile;
        this.cdr.detectChanges();
        
        // Charger les annonces du vendeur
        this.adService.getAds({ ownerId: this.userId }).subscribe({
          next: (ads: any[]) => {
            // Ne pas afficher les annonces vendues sur le profil public
            this.userAds = ads.filter(ad => ad.status !== 'SOLD').map(ad => {
              let finalImageUrl = ad.image_data || '';
              if (finalImageUrl.startsWith('["')) {
                try {
                  const images = JSON.parse(finalImageUrl);
                  finalImageUrl = images[0] || '';
                } catch (e) {
                  finalImageUrl = finalImageUrl.replace(/\["|"]/g, '');
                }
              }
              return { ...ad, imageUrl: finalImageUrl };
            });
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
