import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class ChatMessage extends Document {
  @Prop({ required: true })
  ad_id: string; // ID de l'annonce MySQL

  @Prop({ required: true })
  sender_id: string; // ID de l'expéditeur MySQL

  @Prop({ required: true })
  receiver_id: string; // ID du destinataire MySQL

  @Prop({ required: true })
  content: string;
}

export const MessageSchema = SchemaFactory.createForClass(ChatMessage);
