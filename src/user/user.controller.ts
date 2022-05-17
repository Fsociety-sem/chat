import { Controller, Get, UseGuards } from '@nestjs/common'
import {
  ApiHeader,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { UserService } from './user.service'
import { AuthGuard } from 'src/auth/guards/auth.guard'
import { UserResponseDto } from 'src/auth/dto/response.dto'

@Controller('user')
@UseGuards(AuthGuard)
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiHeader({ name: 'access_token', required: true })
  @ApiOkResponse({
    description: 'All users',
    type: [UserResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid token',
  })
  private getAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll()
  }
}
