import {
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { User as PrismaUser, Role } from '@prisma/client'
import { Cache } from 'cache-manager'

import { SignDto } from 'src/auth/dto/sign.dto'
import { PrismaService } from 'src/prisma.service'
import { TokenService } from 'src/token/token.service'
import { UserResponseDto } from '../auth/dto/response.dto'
import { UserStatus } from './status.enum'
import { User } from './types/user.type'

@Injectable()
export class UserService {
  private readonly userSelect = {
    id: true,
    name: true,
    roles: true,
  }

  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  public async create(userDto: SignDto): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { name: userDto.name },
      rejectOnNotFound: false,
    })
    if (user) throw new ConflictException('User with this name already exist')
    return this.prismaService.user.create({
      select: this.userSelect,
      data: {
        ...userDto,
        roles: [Role.USER],
      },
    })
  }

  public async findUserById(id: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      select: this.userSelect,
      where: { id },
    })
    if (!user) throw new NotFoundException('User with this id was not found')
    return user
  }

  public async findUserByName(name: string): Promise<PrismaUser> {
    const user = await this.prismaService.user.findUnique({
      where: { name },
    })
    if (!user) throw new NotFoundException('User with this name was not found')
    return user
  }

  public async findAll(): Promise<UserResponseDto[]> {
    return this.prismaService.user.findMany({
      select: this.userSelect,
    })
  }

  public async changeUserStatus(token: string, status: UserStatus) {
    const userId = await this.tokenService.verifyAccessToken(token)
    await this.cacheManager.set(`${userId}.status`, status, {
      ttl: 7200,
    })
  }

  public async getUserStatus(userId: number): Promise<UserStatus> {
    return this.cacheManager.get(`${userId}.status`)
  }
}
