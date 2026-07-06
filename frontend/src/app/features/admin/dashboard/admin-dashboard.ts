import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminStats, AdminUser } from '../../../core/services/admin.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  users: AdminUser[] = [];
  isLoading = true;

  // Settings
  feePercentage: number = 5.00;
  feeFixed: number = 0.50;
  isSavingSettings = false;

  // Stocke les montants à ajouter/retirer pour chaque utilisateur (ex: { 'user-id': 50 })
  creditAdjustments: { [key: string]: number } = {};
  isUpdating: { [key: string]: boolean } = {};

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    this.adminService.getStats().subscribe({
      next: (s) => {
        this.stats = s;
        this.cdr.detectChanges();
      },
      error: (e) => console.error(e)
    });

    this.adminService.getSettings().subscribe({
      next: (settings) => {
        if (settings) {
          this.feePercentage = Number(settings.feePercentage);
          this.feeFixed = Number(settings.feeFixed);
          this.cdr.detectChanges();
        }
      },
      error: (e) => console.error(e)
    });

    this.adminService.getUsers().subscribe({
      next: (u) => {
        this.users = u;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error(e);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snackBar.open("Erreur lors du chargement des utilisateurs (Êtes-vous bien Admin ?)", "Fermer", { duration: 4000 });
      }
    });
  }

  updateCredits(user: AdminUser) {
    const amount = this.creditAdjustments[user.id];
    if (amount === undefined || amount === null || amount === 0) {
      return;
    }

    this.isUpdating[user.id] = true;
    this.cdr.detectChanges();

    this.adminService.updateCredits(user.id, amount).subscribe({
      next: (res) => {
        this.isUpdating[user.id] = false;
        user.credits = res.credits;
        this.creditAdjustments[user.id] = 0; // reset
        this.cdr.detectChanges();
        this.snackBar.open(`Le solde de ${user.pseudo} a été mis à jour !`, "Fermer", { duration: 3000 });
      },
      error: (e) => {
        this.isUpdating[user.id] = false;
        console.error(e);
        this.cdr.detectChanges();
        this.snackBar.open("Erreur lors de la mise à jour du solde.", "Fermer", { duration: 3000 });
      }
    });
  }

  saveSettings() {
    this.isSavingSettings = true;
    this.cdr.detectChanges();

    this.adminService.updateSettings(this.feePercentage, this.feeFixed).subscribe({
      next: () => {
        this.isSavingSettings = false;
        this.cdr.detectChanges();
        this.snackBar.open("Paramètres sauvegardés avec succès !", "Fermer", { duration: 3000 });
      },
      error: (e) => {
        this.isSavingSettings = false;
        console.error(e);
        this.cdr.detectChanges();
        this.snackBar.open("Erreur lors de la sauvegarde.", "Fermer", { duration: 3000 });
      }
    });
  }
}
