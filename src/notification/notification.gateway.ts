import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log('New client connected');
  }

  @SubscribeMessage('join')
  handleJoinRoom(client: Socket, room: string) {
    console.log('Client joined room ', room);
    client.join(room);
  }

  sendMessageToRoom(room: string, message: any) {
    this.server.to(room).emit('message', message);
  }
}
