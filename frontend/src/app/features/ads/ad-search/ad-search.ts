import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdCardComponent } from '../../../shared/components/ad-card/ad-card';
import { AdService } from '../../../core/services/ad.service';

@Component({
  selector: 'app-ad-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdCardComponent],
  templateUrl: './ad-search.html',
  styleUrls: ['./ad-search.css']
})
export class AdSearchComponent implements OnInit {
  filterForm: FormGroup;
  searchResults: any[] = [];
  isLoading = true;
  showMobileFilters = false;

  categories = [
    { id: 1, name: 'Vêtements' },
    { id: 2, name: 'Chaussures' },
    { id: 3, name: 'Maison' },
    { id: 4, name: 'Électronique' },
    { id: 5, name: 'Loisirs & Jeux' }
  ];

  constructor(
    private fb: FormBuilder, 
    private adService: AdService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      keyword: [''],
      category: [''],
      size: [''],
      condition: [''],
      brand: [''],
      sort: ['newest'],
      minPrice: [''],
      maxPrice: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // On remplit tout le formulaire avec les valeurs de l'URL ! 📋
      this.filterForm.patchValue({
        keyword: params['keyword'] || '',
        category: params['category'] || '',
        size: params['size'] || '',
        condition: params['condition'] || '',
        brand: params['brand'] || '',
        sort: params['sort'] || 'newest',
        minPrice: params['minPrice'] || '',
        maxPrice: params['maxPrice'] || ''
      });
      this.loadAds();
    });
  }

  loadAds() {
    this.isLoading = true;
    const filters = this.filterForm.value;

    this.adService.getAds(filters).subscribe({
      next: (ads) => {
        this.searchResults = ads.map(ad => {
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
        console.error("Erreur technique :", err);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    // On change l'URL, ngOnInit s'occupera du reste ! 🚀
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.filterForm.value,
        refresh: Date.now()
      },
      queryParamsHandling: 'merge'
    });
  }

  resetFilters() {
    this.filterForm.reset();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { refresh: Date.now() } // On vide tout ! 🏁
    });
  }

  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
  }
}
