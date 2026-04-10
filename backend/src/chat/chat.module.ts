import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessage, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatMessage.name, schema: MessageSchema }])
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
