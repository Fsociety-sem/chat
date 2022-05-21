import { UseGuards } from '@nestjs/common'
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { MessageService } from './message.service'
import { MessageDto } from './dto/message.dto'
import { SendMessageGuard } from 'src/auth/guards/send-message.guard'
import { GetUserId } from 'src/decorators/user-id.decorator'
import { AuthGuard } from 'src/auth/guards/auth.guard'

@WebSocketGateway({
  cors: {
    orining: '*',
  },
})
@UseGuards(AuthGuard)
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server
  constructor(private readonly messageService: MessageService) {}

  @SubscribeMessage('sendMessage')
  @UseGuards(SendMessageGuard)
  private async send(
    @MessageBody() { friendId, text }: MessageDto,
    @GetUserId() userId: number,
  ): Promise<MessageDto> {
    const socketId = await this.messageService.getSocketIdByUserId(friendId)
    if (!socketId) return
    const message = await this.messageService.send(userId, friendId, text)
    this.server.to(socketId).emit('message', message)

    return message
  }

  @SubscribeMessage('findAllMessages')
  private findAll(
    @GetUserId() userId: number,
    @MessageBody('friendId') friendId: number,
  ): Promise<MessageDto[]> {
    return this.messageService.findAll(userId, friendId)
  }

  public handleConnection(client: Socket): Promise<void> {
    return this.messageService.handleConnection(
      client.handshake.auth.access_token as string,
      client.id,
    )
  }

  public handleDisconnect(@GetUserId() userId: number): Promise<void> {
    return this.messageService.handleDisconnect(userId)
  }
}
