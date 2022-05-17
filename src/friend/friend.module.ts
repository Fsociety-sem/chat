import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

import { FriendController } from './friend.controller'
import { FriendService } from './friend.service'
import { UserModule } from 'src/user/user.module'
import { TokenModule } from 'src/token/token.module'

@Module({
  imports: [UserModule, TokenModule],
  controllers: [FriendController],
  providers: [FriendService, PrismaService],
  exports: [FriendService],
})
export class FriendModule {}
