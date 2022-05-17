import { Module } from '@nestjs/common'

import { UserService } from './user.service'
import { UserController } from './user.controller'
import { TokenModule } from 'src/token/token.module'
import { PrismaService } from 'src/prisma.service'

@Module({
  imports: [TokenModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
