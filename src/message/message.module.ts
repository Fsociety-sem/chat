import { Module } from '@nestjs/common'

import { MessageService } from './message.service'
import { MessageGateway } from './message.gateway'
import { TokenModule } from 'src/token/token.module'
import { FriendModule } from 'src/friend/friend.module'
import { PrismaService } from 'src/prisma.service'

@Module({
  imports: [TokenModule, FriendModule],
  providers: [MessageGateway, MessageService, PrismaService],
})
export class MessageModule {}
