import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'

import { PrismaService } from 'src/prisma.service'
import { TokenService } from 'src/token/token.service'
import { UserStatus } from 'src/user/status.enum'
import { MessageDto } from './dto/message.dto'
import { PrismaMessage } from './types/prisma-message'

@Injectable()
export class MessageService {
  private messageInclude = {
    user: {
      select: {
        name: true,
      },
    },
    friend: {
      select: {
        name: true,
      },
    },
  }

  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  public async send(
    userId: number,
    friendId: number,
    text: string,
  ): Promise<MessageDto> {
    const message = {
      userId,
      friendId,
      text,
    }
    const newMessage = await this.prismaService.message.create({
      data: message,
      include: this.messageInclude,
    })
    return this.prepareMessageDto(newMessage)
  }

  public async findAll(
    userId: number,
    friendId: number,
  ): Promise<MessageDto[]> {
    const messages = await this.prismaService.message.findMany({
      where: {
        OR: [
          {
            userId,
            friendId,
          },
          {
            userId: friendId,
            friendId: userId,
          },
        ],
      },
      include: this.messageInclude,
    })
    return messages.map(this.prepareMessageDto)
  }

  public getSocketIdByUserId(userId: number): Promise<string> {
    return this.cacheManager.get(`${userId}.socket`)
  }

  public async handleConnection(
    token: string,
    socketId: string,
  ): Promise<void> {
    try {
      const userId = await this.tokenService.verifyAccessToken(token)
      await this.cacheManager.set(`${userId}.socket`, socketId, {
        ttl: 7200,
      })
      await this.changeUserStatus(userId, UserStatus.OFLINE)
    } catch (error) {
      console.log(error)
    }
  }

  public handleDisconnect(userId: number): Promise<void> {
    return this.changeUserStatus(userId, UserStatus.OFLINE)
  }

  private async changeUserStatus(userId: number, status: UserStatus) {
    await this.cacheManager.set(`${userId}.status`, status, {
      ttl: 7200,
    })
  }

  private prepareMessageDto(message: PrismaMessage): MessageDto {
    const { userId, user, friend, friendId, text } = message
    return {
      userId,
      userName: user.name,
      friendName: friend.name,
      friendId,
      text,
    }
  }
}
