import { Injectable } from '@nestjs/common'

import { TokenService } from 'src/token/token.service'
import { UserStatus } from 'src/user/status.enum'
import { UserService } from 'src/user/user.service'
import { MessageDto } from './dto/message.dto'
import { IUserSocket } from './interfaces/user-socket.interfaces'

@Injectable()
export class MessageService {
  private readonly messages: MessageDto[] = []
  private readonly userIdSocket: IUserSocket[] = []

  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  public async send(
    userId: number,
    friendId: number,
    text: string,
  ): Promise<MessageDto> {
    const { name } = await this.userService.findUserById(userId)
    const friend = await this.userService.findUserById(friendId)
    const message: MessageDto = {
      userId,
      userName: name,
      friendName: friend.name,
      friendId,
      text,
    }
    this.messages.push(message)
    return message
  }

  public async findAll(
    userId: number,
    friendId: number,
  ): Promise<MessageDto[]> {
    return this.messages.filter(
      (item) =>
        JSON.stringify([item.userId, item.friendId].sort()) ===
        JSON.stringify([userId, friendId].sort()),
    )
  }

  public getSocketIdByUserId(userId: number): string {
    return this.userIdSocket.find((item) => item.userId === userId).socketId
  }

  public async handleConnection(
    token: string,
    socketId: string,
  ): Promise<void> {
    const userId = await this.tokenService.verifyAccessToken(token)
    this.userIdSocket.push({
      userId,
      socketId,
    })
    await this.userService.changeUserStatus(userId, UserStatus.OFLINE)
  }

  public handleDisconnect(userId: number): Promise<void> {
    return this.userService.changeUserStatus(userId, UserStatus.OFLINE)
  }
}
