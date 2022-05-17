import { UseGuards } from '@nestjs/common'
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { MessageService } from './message.service'
import { MessageDto } from './dto/message.dto'
import { SendMessageGuard } from 'src/auth/guards/send-message.guard'
import { UserService } from 'src/user/user.service'
import { UserStatus } from 'src/user/status.enum'

@WebSocketGateway({
  cors: {
    orining: '*',
  },
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server
  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  @SubscribeMessage('sendMessage')
  @UseGuards(SendMessageGuard)
  private async send(
    @MessageBody() { friendId, text }: MessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<MessageDto> {
    const message = await this.messageService.send(
      text,
      friendId,
      client.handshake.headers.access_token as string,
    )
    this.server.emit('message', message)

    return message
  }

  @SubscribeMessage('findAllMessages')
  private findAll(
    @MessageBody('friendId') friendId: number,
    @ConnectedSocket() client: Socket,
  ): Promise<MessageDto[]> {
    return this.messageService.findAll(
      friendId,
      client.handshake.headers.access_token as string,
    )
  }

  public handleConnection(client: Socket) {
    return this.userService.changeUserStatus(
      client.handshake.headers.access_token as string,
      UserStatus.ONLINE,
    )
  }

  public handleDisconnect(client: Socket) {
    return this.userService.changeUserStatus(
      client.handshake.headers.access_token as string,
      UserStatus.OFLINE,
    )
  }
}
