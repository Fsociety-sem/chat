import { CacheModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as redisStore from 'cache-manager-redis-store'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import configuration from './config/configuration'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { FriendModule } from './friend/friend.module'
import { MessageModule } from './message/message.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        url: configService.get<string>('redis.url'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    FriendModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
