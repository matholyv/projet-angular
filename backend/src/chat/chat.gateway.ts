import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map to store connected users: userId -> socketId
  private activeSockets = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`[WebSocket] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Client disconnected: ${client.id}`);
    for (const [userId, socketId] of this.activeSockets.entries()) {
      if (socketId === client.id) {
        this.activeSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('identify')
  handleIdentify(client: Socket, userId: string) {
    console.log(`[WebSocket] User ${userId} identified with socket ${client.id}`);
    this.activeSockets.set(String(userId), client.id);
  }

  sendMessageToUser(userId: string, message: any) {
    const socketId = this.activeSockets.get(String(userId));
    if (socketId) {
      this.server.to(socketId).emit('newMessage', message);
    }
  }

  notifyBalanceUpdate(userId: string) {
    const socketId = this.activeSockets.get(String(userId));
    if (socketId) {
      this.server.to(socketId).emit('balanceUpdated');
    }
  }
}
