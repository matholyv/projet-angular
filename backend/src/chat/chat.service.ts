import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name) 
    private readonly messageModel: Model<ChatMessage>
  ) {}

  /**
   * Enregistrer un nouveau message dans MongoDB
   */
  async create(messageData: any): Promise<ChatMessage> {
    const newMessage = new this.messageModel(messageData);
    return newMessage.save();
  }

  /**
   * Récupérer l'historique complet des messages entre deux utilisateurs pour une annonce donnée
   * Triés par date (du plus ancien au plus récent)
   */
  async findConversation(adId: string, user1: string, user2: string): Promise<ChatMessage[]> {
    return this.messageModel.find({
      ad_id: adId,
      $or: [
        { sender_id: user1, receiver_id: user2 },
        { sender_id: user2, receiver_id: user1 }
      ]
    })
    .sort({ timestamp: 1 })
    .exec();
  }
}
