import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Friend, FriendStatus } from '@prisma/client'

import { PrismaService } from 'src/prisma.service'
import { TokenService } from 'src/token/token.service'
import { UserService } from 'src/user/user.service'
import { AllRequestsResponseDto } from './dto/all-requests-response.dto'

@Injectable()
export class FriendService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
    private readonly userSerice: UserService,
  ) {}

  public async requestFriendship(
    accessToken: string,
    friendId: number,
  ): Promise<Friend> {
    const userId = await this.tokenService.verifyAccessToken(accessToken)
    if (userId === friendId)
      throw new BadRequestException('You cannot add yourself as friend')
    const request = await this.prismaService.friend.findMany({
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
    })
    if (request.length)
      throw new ConflictException('Friend request already exists')

    return this.prismaService.friend.create({
      data: {
        userId,
        friendId,
        status: FriendStatus.REQUESTED,
      },
    })
  }

  public async getRequests(
    accessToken: string,
  ): Promise<AllRequestsResponseDto> {
    const userId = await this.tokenService.verifyAccessToken(accessToken)
    const requests = await this.prismaService.friend.findMany({
      where: {
        OR: [
          {
            userId,
          },
          {
            friendId: userId,
          },
        ],
      },
      include: {
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
      },
    })

    const data = await requests.reduce(
      async (acc, item) => {
        const { status, ...restItem } = item
        if (status === FriendStatus.FRIEND) {
          const { friendId } = restItem
          const lineStatus = await this.userSerice.getUserStatus(
            userId === restItem.userId ? friendId : friendId,
          )
          ;(await acc).friends.push({ ...restItem, friendStatus: lineStatus })
        } else if (
          status === FriendStatus.REQUESTED &&
          userId === restItem.userId
        ) {
          ;(await acc).outcoming.push(restItem)
        } else {
          ;(await acc).incoming.push(restItem)
        }
        return acc
      },
      Promise.resolve({
        incoming: [],
        outcoming: [],
        friends: [],
      }),
    )
    return data
  }

  public async acceptRequest(accessToken: string, id: string): Promise<void> {
    const userId = await this.tokenService.verifyAccessToken(accessToken)
    const { friendId } = await this.prismaService.friend.findUnique({
      where: { id },
      select: {
        friendId: true,
      },
    })
    if (userId !== friendId) throw new ForbiddenException()
    await this.prismaService.friend.update({
      data: {
        status: FriendStatus.FRIEND,
      },
      where: {
        id,
      },
    })
  }

  public async deleteFriend(accessToken: string, id: string): Promise<void> {
    const userId = await this.tokenService.verifyAccessToken(accessToken)
    const request = await this.prismaService.friend.findMany({
      where: {
        id,
        OR: [
          {
            userId,
            friendId: userId,
          },
        ],
      },
    })
    if (!request.length) throw new ForbiddenException()

    await this.prismaService.friend.delete({ where: { id } })
  }

  public async isFriend(userId: number, friendId: number): Promise<boolean> {
    const res = await this.prismaService.friend.findMany({
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
        status: FriendStatus.FRIEND,
      },
    })
    return !!res.length
  }
}