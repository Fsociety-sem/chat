import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      rejectOnNotFound: {
        findUnique: {
          User: (err) => new NotFoundException(err.message),
        },
      },
    })
  }
  async onModuleInit() {
    await this.$connect()
  }
}
