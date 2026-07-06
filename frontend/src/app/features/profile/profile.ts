import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Pour le formulaire de recharge
import { AdService } from '../../core/services/ad.service';
import { AuthService } from '../../core/services/auth.service';
import { ReviewService } from '../../core/services/review.service';
import { TransactionsComponent } from './transactions/transactions';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TransactionsComponent, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  myAds: any[] = [];
  isLoading = true;
  hasLoadedAds = false;
  userReviews: any = null;

  // Gestion des onglets
  activeTab: 'ads' | 'wallet' | 'transactions' | 'reviews' = 'ads';
  showDeleteModal = false;
  adToDeleteId: number | null = null;

  // Formulaire de recharge
  refillAmount: number = 20;
  cardNumber: string = '';
  cardName: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  isRefilling = false;
  editDescription: string = '';
  isSavingBio: boolean = false;

  constructor(
    private adService: AdService, 
    private authService: AuthService,
    private reviewService: ReviewService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // S'abonner aux changements d'utilisateur pour avoir le solde en temps réel
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.description !== undefined && this.editDescription === '') {
        this.editDescription = user.description || '';
      }
      if (user && !this.userReviews) {
        this.loadUserReviews(user.id || user.userId || user.sub);
      }
    });

    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      // S'abonner aux paramètres d'URL pour ouvrir l'onglet souhaité (ex: ?tab=wallet) 🎯
      this.route.queryParams.subscribe(params => {
        if (params['tab'] === 'wallet') {
          this.activeTab = 'wallet';
        } else if (params['tab'] === 'transactions') {
          this.activeTab = 'transactions';
        } else if (params['tab'] === 'reviews') {
          this.activeTab = 'reviews';
        } else {
          this.activeTab = 'ads';
        }
        this.cdr.detectChanges();
      });

      // Forcer le rechargement du solde depuis la DB au démarrage
      this.authService.refreshUserBalance().subscribe({
        next: () => {
          this.loadMyAds();
          if (this.currentUser) {
            this.editDescription = this.currentUser.description || '';
          }
        },
        error: () => {
          this.loadMyAds();
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  saveDescription() {
    if (!this.currentUser) return;
    this.isSavingBio = true;
    this.cdr.detectChanges();

    this.authService.updateDescription(this.currentUser.id, this.editDescription).subscribe({
      next: () => {
        this.isSavingBio = false;
        this.cdr.detectChanges();
        this.snackBar.open("Description mise à jour avec succès !", "Fermer", { duration: 3000 });
      },
      error: () => {
        this.isSavingBio = false;
        this.cdr.detectChanges();
        this.snackBar.open("Erreur lors de la mise à jour.", "Fermer", { duration: 3000 });
      }
    });
  }

  loadMyAds() {
    if (!this.hasLoadedAds) {
      this.isLoading = true;
      this.cdr.detectChanges();
    }
    const userId = this.currentUser?.id || this.currentUser?.userId || this.currentUser?.sub;
    this.adService.getAds({ ownerId: userId }).subscribe({
      next: (ads) => {
        this.myAds = ads.map((ad: any) => {
          let finalImageUrl = ad.image_data || '';
          if (finalImageUrl.startsWith('["')) {
            try {
              const images = JSON.parse(finalImageUrl);
              finalImageUrl = images[0] || '';
            } catch (e) {
              finalImageUrl = finalImageUrl.replace(/\["|"]/g, '');
            }
          }
          return { ...ad, imageUrl: finalImageUrl };
        });
        this.isLoading = false;
        this.hasLoadedAds = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des annonces', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUserReviews(userId: string) {
    this.reviewService.getUserReviews(userId).subscribe({
      next: (res) => {
        this.userReviews = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  switchTab(tab: 'ads' | 'wallet' | 'transactions' | 'reviews') {
    this.activeTab = tab;
    
    // Mettre à jour les paramètres de l'URL pour garder la navigation synchronisée 🎯
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });

    if (tab === 'ads') {
      this.loadMyAds();
    }
    this.cdr.detectChanges();
  }

  // Simulation de recharge de carte bancaire
  onSubmitRefill() {
    if (this.refillAmount <= 0) {
      this.snackBar.open("Veuillez saisir un montant supérieur à 0.", "Fermer", { duration: 3000 });
      return;
    }
    if (!this.cardNumber || !this.cardName || !this.cardExpiry || !this.cardCvv) {
      this.snackBar.open("Veuillez remplir toutes les informations de paiement.", "Fermer", { duration: 3000 });
      return;
    }

    this.isRefilling = true;
    this.cdr.detectChanges();

    // Simuler le délai de validation bancaire (pour l'immersion 💳)
    setTimeout(() => {
      this.authService.refill(this.refillAmount).subscribe({
        next: (updatedUser) => {
          this.isRefilling = false;
          // Réinitialiser les champs
          this.cardNumber = '';
          this.cardName = '';
          this.cardExpiry = '';
          this.cardCvv = '';
          this.snackBar.open(`Paiement de ${this.refillAmount} € validé ! Votre solde a été mis à jour. 🥳`, "Fermer", { duration: 4000 });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isRefilling = false;
          this.snackBar.open("Erreur lors de la transaction. Veuillez vérifier vos données bancaires fictives.", "Fermer", { duration: 4000 });
          this.cdr.detectChanges();
        }
      });
    }, 1800);
  }

  deleteAd(id: number) {
    this.adToDeleteId = id;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  executeDeleteAd() {
    if (this.adToDeleteId === null) return;
    const id = this.adToDeleteId;
    this.showDeleteModal = false;
    this.adToDeleteId = null;
    this.cdr.detectChanges();

    this.adService.deleteAd(id).subscribe({
      next: () => {
        this.loadMyAds();
        this.snackBar.open("Annonce supprimée avec succès !", "Fermer", { duration: 3000 });
      },
      error: (err) => {
        console.error('Erreur lors de la suppression', err);
        this.cdr.detectChanges();
        this.snackBar.open("Erreur lors de la suppression.", "Fermer", { duration: 3000 });
      }
    });
  }

  showReviewModal = false;
  isSubmittingReview = false;
  reviewData = { reviewerId: '', revieweeId: '', transactionId: '', rating: 5, comment: '' };
  reviewTargetAdTitle = '';
  reviewTargetTransaction: any = null;
  reviewIsSale = false;

  openReviewModal(event: {transaction: any, isSale: boolean}) {
    const { transaction, isSale } = event;
    this.reviewTargetTransaction = transaction;
    this.reviewIsSale = isSale;
    
    let reviewerId = '';
    if (this.currentUser) {
      reviewerId = this.currentUser.id || this.currentUser.userId || this.currentUser.sub;
    }
    
    this.reviewData = {
      reviewerId: reviewerId,
      revieweeId: isSale ? transaction.buyer.id : transaction.seller.id,
      transactionId: transaction.id,
      rating: 5,
      comment: ''
    };
    this.reviewTargetAdTitle = transaction.product?.title || 'Produit';
    this.showReviewModal = true;
    this.cdr.detectChanges();
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.cdr.detectChanges();
  }

  submitReview() {
    if (!this.reviewData.comment) {
      this.snackBar.open("Veuillez laisser un commentaire.", "Fermer", { duration: 3000 });
      return;
    }
    
    this.isSubmittingReview = true;
    this.cdr.detectChanges();

    this.reviewService.createReview(this.reviewData).subscribe({
      next: () => {
        this.isSubmittingReview = false;
        this.showReviewModal = false;
        
        // Mettre à jour l'objet transaction localement pour faire disparaître le bouton
        if (this.reviewTargetTransaction) {
          if (this.reviewIsSale) {
            this.reviewTargetTransaction.sellerReviewed = true;
          } else {
            this.reviewTargetTransaction.buyerReviewed = true;
          }
        }
        
        this.snackBar.open("Merci pour votre avis !", "Fermer", { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmittingReview = false;
        const msg = err.error?.message || "Erreur lors de l'envoi de l'avis.";
        this.snackBar.open(msg, "Fermer", { duration: 4000 });
        this.cdr.detectChanges();
      }
    });
  }
}
