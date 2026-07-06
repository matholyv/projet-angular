import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ad-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ad-card.html',
  styleUrls: ['./ad-card.css']
})
export class AdCardComponent implements OnInit {
  @Input() id: any; // On récupère l'ID pour le lien ! 🔗
  @Input() price: number = 0;
  @Input() title: string = '';
  @Input() imageUrl: string = '';
  @Input() condition: string = '';
  @Input() size: string = ''; // Nouvelle info !
  @Input() brand: string = ''; // Marque
  @Input() authorPseudo: string = '';

  isFavorite: boolean = false;

  ngOnInit() {
    this.checkIfFavorite();
  }

  checkIfFavorite() {
    const favs = JSON.parse(localStorage.getItem('2ndmain_favorites') || '[]');
    this.isFavorite = favs.includes(this.id);
  }

  toggleFavorite(event: Event) {
    event.stopPropagation(); // Évite de cliquer sur l'annonce et de changer de page
    event.preventDefault(); 
    
    let favs = JSON.parse(localStorage.getItem('2ndmain_favorites') || '[]');
    if (this.isFavorite) {
      favs = favs.filter((favId: any) => favId !== this.id);
    } else {
      favs.push(this.id);
    }
    localStorage.setItem('2ndmain_favorites', JSON.stringify(favs));
    this.isFavorite = !this.isFavorite;
  }
}
