import { Component, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction';
import { AuthService } from '../../../core/services/auth.service';
import { Transaction } from '../../../core/models/transaction.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatSnackBarModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.css']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  purchases: Transaction[] = [];
  sales: Transaction[] = [];
  isLoading = true;
  private subs = new Subscription();

  @Output() reviewRequested = new EventEmitter<{transaction: Transaction, isSale: boolean}>();

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let hasLoaded = false;
    this.subs.add(
      this.authService.currentUser$.subscribe(user => {
        if (user && !hasLoaded) {
          hasLoaded = true;
          this.loadTransactions();
        }
      })
    );
  }

  loadTransactions() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.transactionService.getMyTransactions().subscribe({
      next: (data) => {
        this.purchases = data?.purchases || [];
        this.sales = data?.sales || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des transactions', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  requestReview(transaction: Transaction, isSale: boolean = false) {
    this.reviewRequested.emit({ transaction, isSale });
  }
}
