import { Injectable } from '@nestjs/common'

import { TokenService } from 'src/token/token.service'
import { UserService } from 'src/user/user.service'
import { MessageDto } from './dto/message.dto'

@Injectable()
export class MessageService {
  private readonly messages: MessageDto[] = []

  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  public async send(
    text: string,
    friendId: number,
    token: string,
  ): Promise<MessageDto> {
    const userId = await this.tokenService.verifyAccessToken(token)
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

  public async findAll(friendId: number, token: string): Promise<MessageDto[]> {
    const userId = await this.tokenService.verifyAccessToken(token)
    return this.messages.filter(
      (item) =>
        JSON.stringify([item.userId, item.friendId].sort()) ===
        JSON.stringify([userId, friendId].sort()),
    )
  }
}
