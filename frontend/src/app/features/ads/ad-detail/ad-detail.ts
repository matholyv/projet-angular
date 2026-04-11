import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ad-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-detail.html',
  styleUrls: ['./ad-detail.css']
})
export class AdDetailComponent {
  // Données fictives simulant l'API pour patienter jusqu'à la connexion BD
  @Input() ad = {
    id: '12345',
    title: 'Veste Zara bleue marine',
    description: 'Veste portée seulement 2 fois. Très bon état, taille L mais convient à une taille M.\n\nIdéal pour la mi-saison !',
    price: 25,
    categoryName: 'Vêtements',
    imageUrl: '', // pas d'image par défaut pour voir le placeholder
    createdAt: new Date(),
    author: {
      pseudo: 'ToulouseVintage',
      avatarUrl: null
    }
  };

  onContactSeller() {
    alert("Ce bouton ouvrira le panel de Chat (Messagerie) avec le vendeur " + this.ad.author.pseudo);
  }
}
