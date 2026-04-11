import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent {
  // Données fictives pour la maquette admin
  stats = {
    totalUsers: 1420,
    totalAds: 345,
    reportedAds: 3
  };

  reportedAdsList = [
    { id: 101, title: 'Iphone 15 Pro Max pas cher', author: 'Scammer99', reason: 'Suspicion d\'arnaque', date: new Date('2026-04-10') },
    { id: 102, title: 'Vêtements de marque', author: 'UserTest', reason: 'Contrefaçon présumée', date: new Date('2026-04-10') },
    { id: 103, title: 'Titre comportant des insultes', author: 'BadBoy', reason: 'Signalement utilisateur (spam)', date: new Date('2026-04-11') },
  ];

  deleteAd(adId: number) {
    if(confirm('Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?')) {
      this.reportedAdsList = this.reportedAdsList.filter(ad => ad.id !== adId);
      this.stats.reportedAds--;
      this.stats.totalAds--;
      alert(`L'annonce #${adId} a été supprimée des serveurs 2ndmain.`);
    }
  }

  ignoreReport(adId: number) {
    this.reportedAdsList = this.reportedAdsList.filter(ad => ad.id !== adId);
    this.stats.reportedAds--;
  }

  banUser(author: string) {
    if(confirm(`Bannir définitivement l'utilisateur ${author} ? Il ne pourra plus recréer de compte.`)) {
      alert(`Utilisateur ${author} banni du système avec succès.`);
    }
  }
}
