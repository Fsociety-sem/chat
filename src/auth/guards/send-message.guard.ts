import {
  BadRequestException,
  CanActivate,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { TokenService } from 'src/token/token.service'
import { FriendService } from 'src/friend/friend.service'

@Injectable()
export class SendMessageGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly friendService: FriendService,
  ) {}

  async canActivate(context): Promise<boolean> {
    const [{ handshake }, { friendId }] = context.args
    const { access_token: accessToken } = handshake.headers
    if (!accessToken)
      throw new UnauthorizedException('Token shoud be defined in token')
    if (!friendId) throw new BadRequestException('Friend id shoud be defined')

    const userId = await this.tokenService.verifyAccessToken(
      accessToken as string,
    )
    return this.friendService.isFriend(userId, friendId)
  }
}
