import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { TokenService } from 'src/token/token.service'

import { UserService } from 'src/user/user.service'
import { SignDto } from './dto/sign.dto'
import { ResponseDto } from './dto/response.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  public async register(createUserDto: SignDto): Promise<ResponseDto> {
    const encryptedPassword = await bcrypt.hash(createUserDto.password, 8)
    const user = await this.userService.create({
      ...createUserDto,
      password: encryptedPassword,
    })

    return {
      user,
      tokens: await this.tokenService.getTokens(user.id),
    }
  }

  public async login(loginDto: SignDto): Promise<ResponseDto> {
    const { name, password } = loginDto
    const {
      id,
      password: hash,
      roles,
    } = await this.userService.findUserByName(name)
    const isPasswordCorrect = await bcrypt.compare(password, hash)
    if (!isPasswordCorrect) throw new UnauthorizedException('Wrong password')

    return {
      user: {
        id,
        name,
        roles,
      },
      tokens: await this.tokenService.getTokens(id),
    }
  }

  public async refresh(refreshToken: string) {
    return this.tokenService.refreshTokens(refreshToken)
  }

  public async logout(accessToken: string): Promise<void> {
    const userId = await this.tokenService.verifyAccessToken(accessToken)
    await this.tokenService.destoyTokens(userId)
  }
}
