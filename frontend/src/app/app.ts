import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('2ndmain');

  constructor(private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isLoggedIn) {
      this.authService.refreshUserBalance().subscribe({
        next: () => console.log('Solde mis à jour depuis le serveur.'),
        error: () => console.error('Erreur lors de la mise à jour du solde.')
      });
    }
  }
}
