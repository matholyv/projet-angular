import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
// On importe notre fameuse carte produit de Vinted !
import { AdCardComponent } from '../../../shared/components/ad-card/ad-card';

@Component({
  selector: 'app-ad-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdCardComponent],
  templateUrl: './ad-search.html',
  styleUrls: ['./ad-search.css']
})
export class AdSearchComponent {
  filterForm: FormGroup;

  categories = [
    { id: 1, name: 'Vêtements' },
    { id: 2, name: 'Maison' },
    { id: 3, name: 'Électronique' },
    { id: 4, name: 'Loisirs & Jeux' }
  ];

  // Résultats fictifs pour la maquette
  searchResults = [
    { title: 'Veste Vintage', price: 25, condition: 'Bon état', imageUrl: '', authorPseudo: 'ToulouseVintage' },
    { title: 'Canapé en velours', price: 150, condition: 'Très bon état', imageUrl: '', authorPseudo: 'Deco31' },
    { title: 'Tablette Pro', price: 200, condition: 'Neuf avec étiquette', imageUrl: '', authorPseudo: 'GeekNerd' },
    { title: 'Lampe industrielle', price: 45, condition: 'Satisfaisant', imageUrl: '', authorPseudo: 'LuminOu' },
    { title: 'Chemise à carreaux', price: 10, condition: 'Bon état', imageUrl: '', authorPseudo: 'RandomAcheteur' },
    { title: 'Jeu vidéo récent', price: 30, condition: 'Très bon état', imageUrl: '', authorPseudo: 'GeekNerd' }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      keyword: [''],
      category: [''],
      minPrice: [''],
      maxPrice: ['']
    });
  }

  applyFilters() {
    console.log('Filtres appliqués : ', this.filterForm.value);
    // Simulation : dans la vraie app, on appelera l'API ici
  }

  resetFilters() {
    this.filterForm.reset();
  }
}
