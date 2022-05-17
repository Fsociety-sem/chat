import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Cache } from 'cache-manager'

import { ITokenConfig } from 'src/config/interfaces/token-config.interface'
import { ITokens } from './interfaces/tokens.interface'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  public async getTokens(userId: number): Promise<ITokens> {
    const { accessSecret, refreshSecret, accessExpireIn, refreshExpireIn } =
      this.configService.get<ITokenConfig>('token')
    const accessToken = await this.jwtService.signAsync(
      { userId },
      {
        secret: accessSecret,
      },
    )
    const refreshToken = await this.jwtService.signAsync(
      { userId },
      {
        secret: refreshSecret,
      },
    )
    await this.cacheManager.set(`${userId}.access`, accessToken, {
      ttl: accessExpireIn,
    })
    await this.cacheManager.set(`${userId}.refresh`, refreshToken, {
      ttl: refreshExpireIn,
    })

    return {
      access: accessToken,
      refresh: refreshToken,
    }
  }

  public async verifyAccessToken(token: string): Promise<number> {
    if (!token)
      throw new UnauthorizedException('Token should be defined in header')
    try {
      const { userId } = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<ITokenConfig>('token').accessSecret,
      })
      const cachedToken = await this.cacheManager.get(`${userId}.access`)
      if (!cachedToken || cachedToken !== token) throw Error
      return userId
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }

  public async refreshTokens(token: string): Promise<ITokens> {
    if (!token)
      throw new BadRequestException('Refresh token should be defined in header')
    try {
      const { userId } = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<ITokenConfig>('token').refreshSecret,
      })
      const cachedToken = await this.cacheManager.get(`${userId}.refresh`)
      if (!cachedToken || cachedToken !== token) throw Error
      return this.getTokens(userId)
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }

  public async destoyTokens(userId: number): Promise<void> {
    await this.cacheManager.del(`${userId}.access`)
    await this.cacheManager.del(`${userId}.refresh`)
  }
}
