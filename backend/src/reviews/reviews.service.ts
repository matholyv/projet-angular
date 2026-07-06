import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { TransactionsService } from '../transactions/transactions.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private readonly transactionsService: TransactionsService,
    private readonly notificationsService: NotificationsService
  ) {}

  async createReview(reviewerId: string, revieweeId: string, transactionId: string, rating: number, comment: string) {
    // Vérifier si la transaction existe et est terminée
    const transaction = await this.transactionsService.findOne(transactionId);
    
    if (!transaction) {
      throw new BadRequestException("Transaction introuvable.");
    }
    
    if (transaction.status !== 'COMPLETED') {
      throw new BadRequestException("La transaction doit être terminée pour laisser un avis.");
    }
    
    // Vérifier si l'utilisateur est bien l'acheteur ou le vendeur
    const isBuyer = String(transaction.buyerId) === String(reviewerId);
    const isSeller = String(transaction.sellerId) === String(reviewerId);
    
    if (!isBuyer && !isSeller) {
      throw new BadRequestException("Vous ne faites pas partie de cette transaction.");
    }
    
    // Vérifier que le reviewee est bien l'autre personne
    const expectedRevieweeId = isBuyer ? transaction.sellerId : transaction.buyerId;
    if (String(expectedRevieweeId) !== String(revieweeId)) {
      throw new BadRequestException("L'utilisateur évalué n'est pas le bon.");
    }

    // Vérifier s'il a déjà laissé un avis
    const existingReview = await this.reviewModel.findOne({ transactionId, reviewerId });
    if (existingReview) {
      throw new BadRequestException("Vous avez déjà laissé un avis pour cette transaction.");
    }

    const newReview = new this.reviewModel({
      reviewerId,
      revieweeId,
      transactionId,
      rating,
      comment
    });

    const savedReview = await newReview.save();
    
    // Notifier le destinataire de l'avis
    await this.notificationsService.createNotification(
      revieweeId,
      'Nouvel avis reçu ! ⭐',
      `Vous avez reçu un nouvel avis de ${rating}/5 étoiles pour la transaction #${transactionId}.`,
      'REVIEW',
      `/profile/${revieweeId}` // Lien vers son profil public (ou juste '/profile')
    );
    
    // Marquer la transaction comme évaluée dans MySQL
    await this.transactionsService.markAsReviewed(transactionId, isBuyer);
    
    return savedReview;
  }

  async getUserReviews(userId: string) {
    const reviews = await this.reviewModel.find({ revieweeId: userId }).sort({ createdAt: -1 }).exec();
    
    // Calcul de la moyenne
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = sum / reviews.length;
    }

    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      reviews
    };
  }
}
