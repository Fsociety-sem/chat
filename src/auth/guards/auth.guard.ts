import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { TokenService } from 'src/token/token.service'
import { RequestWithUserId } from '../types/user-request'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType()
    const accessToken: string = {
      http: context.switchToHttp().getRequest().headers?.access_token,
      ws: context.switchToWs().getClient().handshake?.auth?.access_token,
    }[type]
    if (!accessToken)
      throw new UnauthorizedException('Token shoud be defined in token')

    const userId = await this.tokenService.verifyAccessToken(
      accessToken as string,
    )
    if (type === 'http') {
      context.switchToHttp().getRequest<RequestWithUserId>().userId = userId
    } else if (type === 'ws') {
      context.switchToWs().getClient().handshake.userId = userId
    }
    return true
  }
}
