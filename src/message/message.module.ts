import { Module } from '@nestjs/common'

import { MessageService } from './message.service'
import { MessageGateway } from './message.gateway'
import { TokenModule } from 'src/token/token.module'
import { UserModule } from 'src/user/user.module'
import { FriendModule } from 'src/friend/friend.module'

@Module({
  imports: [TokenModule, UserModule, FriendModule],
  providers: [MessageGateway, MessageService],
})
export class MessageModule {}
