import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  isDarkMode = false;
  isMenuOpen = false;
  currentUser$: any; // Observable pour l'affichage conditionnel

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // On restaure le choix du thème depuis la mémoire (ou faux par défaut)
      const savedTheme = localStorage.getItem('appTheme');
      if (savedTheme === 'dark') {
        this.isDarkMode = true;
        document.body.classList.add('dark-theme');
      } else {
        this.isDarkMode = false;
        document.body.classList.remove('dark-theme');
      }
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkMode) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('appTheme', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('appTheme', 'light');
      }
    }
  }
}
