import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from './schemas/message.schema';
import { AuthService } from '../auth/auth.service';
import { ChatGateway } from './chat.gateway';
import { AdsService } from '../ads/ads.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name) 
    private readonly messageModel: Model<ChatMessage>,
    private readonly authService: AuthService,
    private readonly chatGateway: ChatGateway,
    private readonly adsService: AdsService
  ) {}

  /**
   * Enregistrer un nouveau message dans MongoDB
   */
  async create(messageData: any): Promise<ChatMessage> {
    const newMessage = new this.messageModel(messageData);
    const savedMessage = await newMessage.save();
    
    // Émettre le message en temps réel aux sockets concernés
    this.chatGateway.sendMessageToUser(String(savedMessage.receiver_id), savedMessage);
    this.chatGateway.sendMessageToUser(String(savedMessage.sender_id), savedMessage);

    return savedMessage;
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

  /**
   * Récupère la liste des conversations (boîte de réception) pour un utilisateur
   */
  async getUserConversations(userId: string): Promise<any[]> {
    const rawMessages = await this.messageModel.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }]
    })
    .sort({ timestamp: -1 })
    .exec();

    const conversationsMap = new Map<string, any>();

    for (const msg of rawMessages) {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const key = `${msg.ad_id}_${partnerId}`;

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          adId: msg.ad_id,
          partnerId: partnerId,
          lastMessage: msg.content,
          timestamp: typeof (msg as any).timestamp !== 'undefined' ? (msg as any).timestamp : msg._id.getTimestamp()
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());

    // Enrichir avec le pseudo réel du partenaire depuis TypeORM, ainsi que les détails de l'annonce
    for (const convo of conversations) {
      try {
         const dbUser = await this.authService.findById(convo.partnerId);
         if (dbUser && dbUser.pseudo) {
            convo.partnerName = dbUser.pseudo;
         }
      } catch(err) {
         // Silently fail
      }

      try {
         // Ajout des infos de l'annonce
         const adDetails = await this.adsService.findOne(Number(convo.adId));
         if (adDetails && adDetails.title) {
            convo.adTitle = adDetails.title;
            let img = adDetails.image_data || '';
            if (img.startsWith('["')) {
              try {
                img = JSON.parse(img)[0] || '';
              } catch (e) {
                img = img.replace(/\["|"]/g, '');
              }
            }
            convo.adImage = img;
         }
      } catch(err) {
         // Silently fail
      }
    }

    return conversations;
  }
}
