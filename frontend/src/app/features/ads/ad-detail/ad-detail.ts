import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AdService } from '../../../core/services/ad.service';
import { TransactionService } from '../../../core/services/transaction';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';

import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ad-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSnackBarModule, FormsModule],
  templateUrl: './ad-detail.html',
  styleUrls: ['./ad-detail.css']
})
export class AdDetailComponent implements OnInit {
  ad: any = null;
  isLoading = true;
  isOwner = false;
  currentUser: any = null;
  showBuyModal = false;
  isBuying = false;
  transactionFee = 0.50;
  transactionPercent = 0.05;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adService: AdService,
    private cdr: ChangeDetectorRef,
    private transactionService: TransactionService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private chatService: ChatService
  ) {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  ngOnInit() {
    this.loadFees();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAd(id);
    }
  }

  loadFees() {
    this.transactionService.getFees().subscribe({
      next: (settings) => {
        if (settings) {
          this.transactionPercent = Number(settings.feePercentage) / 100;
          this.transactionFee = Number(settings.feeFixed);
          this.cdr.detectChanges();
        }
      },
      error: (e) => console.error("Erreur chargement des frais :", e)
    });
  }

  loadAd(id: string) {
    this.isLoading = true;
    this.adService.getAdById(id).subscribe({
      next: (data) => {
        let finalImageUrl = data.image_data || '';
        let allImages: string[] = [];

        if (finalImageUrl.startsWith('["')) {
          try {
            const images = JSON.parse(finalImageUrl);
            allImages = images;
            finalImageUrl = images[0] || '';
          } catch (e) {
            finalImageUrl = finalImageUrl.replace(/\["|"]/g, '');
            if (finalImageUrl) allImages = [finalImageUrl];
          }
        } else if (finalImageUrl) {
            allImages = [finalImageUrl];
        }

        this.ad = {
          ...data,
          imageUrl: finalImageUrl,
          images: allImages,
          condition: data.condition || 'Bon état',
          author: {
            id: data.owner?.id || data.owner_id || data.ownerId,
            pseudo: data.owner?.pseudo || 'Vendeur'
          }
        };

        if (this.currentUser && this.ad.author.id) {
          const myId = this.currentUser.id || this.currentUser.userId || this.currentUser.sub;
          this.isOwner = (myId === this.ad.author.id);
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur chargement annonce :", err);
        this.isLoading = false;
      }
    });
  }

  onContactSeller() {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Go au chat et on passera l'id du partenaire, son pseudo et l'id de l'annonce ! 📍
    this.router.navigate(['/messages'], { 
      queryParams: { 
        partnerId: this.ad.author.id, 
        partnerName: this.ad.author.pseudo,
        adId: this.ad.id 
      } 
    });
  }

  get calculateFee(): number {
    if (!this.ad || !this.ad.price) return 0;
    return (this.ad.price * this.transactionPercent) + this.transactionFee;
  }

  get calculateTotal(): number {
    if (!this.ad || !this.ad.price) return 0;
    return Number(this.ad.price) + this.calculateFee;
  }

  acceptTerms = false;
  showSuccessModal = false;
  purchasedTransactionId: string | number | null = null;

  openBuyModal() {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.showBuyModal = true;
    this.acceptTerms = false; // reset
  }

  closeBuyModal() {
    this.showBuyModal = false;
  }

  confirmBuy() {
    if (!this.currentUser || !this.ad || !this.acceptTerms) return;

    if (this.currentUser.credits < this.calculateTotal) {
      this.snackBar.open("Solde insuffisant. Veuillez recharger votre portefeuille.", "Fermer", { duration: 4000 });
      this.router.navigate(['/profile'], { queryParams: { tab: 'wallet' } });
      return;
    }

    this.isBuying = true;
    this.cdr.detectChanges();

    this.transactionService.buyProduct(this.ad.id).subscribe({
      next: (transaction) => {
        this.isBuying = false;
        this.showBuyModal = false;
        this.purchasedTransactionId = transaction.id;

        // Envoyer un message de confirmation automatique
        const msgData = {
          ad_id: String(this.ad.id),
          sender_id: String(this.currentUser.id || this.currentUser.userId || this.currentUser.sub),
          receiver_id: String(this.ad.author.id),
          content: `Automatique : J'ai acheté votre article "${this.ad.title}" ! 📦`
        };

        this.chatService.sendMessage(msgData).subscribe({
          next: () => {
            this.showSuccessModal = true;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("Erreur envoi message auto", err);
            this.showSuccessModal = true;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.isBuying = false;
        console.error(err);
        this.snackBar.open(err.error?.message || "Une erreur est survenue lors de l'achat.", "Fermer", { duration: 4000 });
        this.cdr.detectChanges();
      }
    });
  }

  goToTransaction() {
    if (this.purchasedTransactionId) {
      this.router.navigate(['/transaction', this.purchasedTransactionId]);
    }
  }

  setMainImage(index: number) {
    if (this.ad && this.ad.images) {
      this.currentImageIndex = index;
      this.ad.imageUrl = this.ad.images[index];
    }
  }
}
