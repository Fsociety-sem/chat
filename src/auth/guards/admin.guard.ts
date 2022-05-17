import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { Request } from 'express'

import { TokenService } from 'src/token/token.service'
import { UserService } from 'src/user/user.service'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const {
      headers: { access_token: accessToken },
    } = context.switchToHttp().getRequest<Request>()
    if (!accessToken) return false

    const userId = await this.tokenService.verifyAccessToken(
      accessToken as string,
    )
    const user = await this.userService.findUserById(userId)
    if (!user.roles.includes(Role.ADMIN)) return false

    return true
  }
}
