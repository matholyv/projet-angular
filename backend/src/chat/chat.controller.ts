import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessage } from './schemas/message.schema';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Envoyer un nouveau message
   */
  @Post()
  async sendMessage(@Body() messageData: any): Promise<ChatMessage> {
    return this.chatService.create(messageData);
  }

  /**
   * Récupérer l'historique d'une conversation spécifique
   * Ex: GET /chat?adId=123&user1=abc&user2=def
   */
  @Get()
  async getConversation(
    @Query('adId') adId: string,
    @Query('user1') user1: string,
    @Query('user2') user2: string,
  ): Promise<ChatMessage[]> {
    return this.chatService.findConversation(adId, user1, user2);
  }

  /**
   * Récupérer la boîte de réception d'un utilisateur
   * Ex: GET /chat/inbox?userId=abc
   */
  @Get('inbox')
  async getInbox(@Query('userId') userId: string): Promise<any[]> {
    return this.chatService.getUserConversations(userId);
  }
}
