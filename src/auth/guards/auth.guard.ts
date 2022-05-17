import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'

import { TokenService } from 'src/token/token.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const {
      headers: { access_token: accessToken },
    } = context.switchToHttp().getRequest<Request>()
    if (!accessToken)
      throw new UnauthorizedException('Token shoud be defined in token')

    await this.tokenService.verifyAccessToken(accessToken as string)
    return true
  }
}
