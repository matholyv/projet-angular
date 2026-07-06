import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatMessage, MessageSchema } from './schemas/message.schema';
import { AuthModule } from '../auth/auth.module';
import { AdsModule } from '../ads/ads.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatMessage.name, schema: MessageSchema }]),
    AuthModule,
    AdsModule
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatGateway]
})
export class ChatModule {}
