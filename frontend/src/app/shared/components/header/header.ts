import { Component, Inject, PLATFORM_ID, OnInit, HostListener, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  isMenuOpen = false;
  isNotificationsOpen = false;
  currentUser$: any; // Observable pour l'affichage conditionnel
  currentUser: any = null;
  unreadMessagesCount = 0;
  unreadNotificationsCount = 0;
  notifications: Notification[] = [];
  
  private subs = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) this.isNotificationsOpen = false;
  }
  
  toggleNotifications(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) this.isMenuOpen = false;
  }

  closeMenu() {
    // Petit délai pour laisser le temps au routerLink de faire son travail avant de détruire le DOM
    setTimeout(() => {
      this.isMenuOpen = false;
      this.isNotificationsOpen = false;
      this.cdr.detectChanges();
    }, 10);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-menu') && !target.closest('.notifications-wrapper')) {
      this.isMenuOpen = false;
      this.isNotificationsOpen = false;
    }
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

    // Gérer l'identification Socket et la réception des notifications
    this.subs.add(
      this.authService.currentUser$.subscribe((user: any) => {
        this.currentUser = user;
        if (user) {
          const userId = user.id || user.userId || user.sub;
          if (userId) {
            this.chatService.identify(String(userId));
          }
        }
      })
    );

    // Écouter le compteur global de messages non lus
    this.subs.add(
      this.chatService.unreadCounts$.subscribe(counts => {
        this.unreadMessagesCount = Object.values(counts).reduce((a, b) => a + b, 0);
        this.cdr.detectChanges();
      })
    );
    
    // Écouter les notifications
    this.subs.add(
      this.notificationService.notifications$.subscribe(notifs => {
        this.notifications = notifs;
        this.cdr.detectChanges();
      })
    );
    
    this.subs.add(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadNotificationsCount = count;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch(keyword: string) {
    const cleanKeyword = keyword.trim();
    // On navigue avec un petit paramètre de "cache-busting" (timestamp) pour forcer Angular à voir un changement ! 🚀
    this.router.navigate(['/search'], { 
      queryParams: { 
        keyword: cleanKeyword || null,
        refresh: Date.now() // Ce petit nombre change à chaque clic et force le refresh ! 🏁
      },
      queryParamsHandling: 'merge'
    });
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
  
  onNotificationClick(notif: Notification, event: Event) {
    event.preventDefault();
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif.id).subscribe();
    }
    this.closeMenu();
    if (notif.link) {
      this.router.navigateByUrl(notif.link);
    }
  }
  
  markAllAsRead(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe();
  }
}
