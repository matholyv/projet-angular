import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ad-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-card.html',
  styleUrls: ['./ad-card.css']
})
export class AdCardComponent {
  @Input() price: number = 0;
  @Input() title: string = '';
  @Input() imageUrl: string = '';
  @Input() condition: string = '';
  @Input() authorPseudo: string = '';
}
