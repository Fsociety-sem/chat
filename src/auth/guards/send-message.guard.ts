import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

import { FriendService } from 'src/friend/friend.service'

@Injectable()
export class SendMessageGuard implements CanActivate {
  constructor(private readonly friendService: FriendService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const wsConext = context.switchToWs()
    const { userId } = wsConext.getClient().handshake || {}
    const { friendId } = wsConext.getData()

    if (!userId || !friendId) return false
    return this.friendService.isFriend(userId, friendId)
  }
}
