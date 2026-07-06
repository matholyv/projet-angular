import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  reviewerId: string; // Utilisateur qui laisse l'avis (Acheteur)

  @Prop({ required: true })
  revieweeId: string; // Utilisateur évalué (Vendeur)

  @Prop({ required: true })
  transactionId: string; // Transaction liée

  @Prop({ required: true, min: 1, max: 5 })
  rating: number; // 1 à 5 étoiles

  @Prop({ required: true })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
