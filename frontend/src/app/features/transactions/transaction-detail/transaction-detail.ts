import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction';
import { AuthService } from '../../../core/services/auth.service';
import { Transaction } from '../../../core/models/transaction.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './transaction-detail.html',
  styleUrls: ['./transaction-detail.css']
})
export class TransactionDetailComponent implements OnInit {
  transaction: Transaction | null = null;
  isLoading = true;
  isConfirming = false;
  currentUserId: string | null = null;
  showConfirmModal = false;

  constructor(
    private route: ActivatedRoute,
    private transactionService: TransactionService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      let hasLoaded = false;
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.currentUserId = user.id || user.userId || user.sub;
          if (!hasLoaded) {
            hasLoaded = true;
            this.loadTransaction(id);
          }
        }
      });
    }
  }

  loadTransaction(id: string) {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.transactionService.getMyTransactions().subscribe({
      next: (data) => {
        try {
          const purchases = data?.purchases || [];
          const sales = data?.sales || [];
          const all = [...purchases, ...sales];
          this.transaction = all.find(t => t.id === id) || null;
        } catch (e) {
          console.error("Erreur lors de la lecture des transactions", e);
        } finally {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Erreur HTTP lors de la récupération des transactions", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmReception() {
    if (!this.transaction || this.transaction.buyerId !== this.currentUserId) return;
    this.showConfirmModal = true;
    this.cdr.detectChanges();
  }

  executeConfirmReception() {
    if (!this.transaction) return;
    this.showConfirmModal = false;
    this.isConfirming = true;
    this.cdr.detectChanges();

    this.transactionService.confirmReception(this.transaction.id).subscribe({
      next: (res) => {
        this.transaction = res;
        this.isConfirming = false;
        this.snackBar.open('Réception confirmée avec succès !', 'Fermer', { duration: 4000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isConfirming = false;
        this.snackBar.open('Erreur lors de la confirmation', 'Fermer', { duration: 4000 });
        this.cdr.detectChanges();
      }
    });
  }
}
