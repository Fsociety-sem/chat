import {
  Body,
  Controller,
  Delete,
  Headers,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { SignDto } from './dto/sign.dto'
import { ResponseDto } from './dto/response.dto'
import { AdminGuard } from './guards/admin.guard'
import { TokenService } from 'src/token/token.service'
import { RefreshResponseDto } from './dto/refresh-response.dto'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('registration')
  @ApiCreatedResponse({
    type: ResponseDto,
  })
  @ApiConflictResponse({
    description: 'User with this name already exist',
  })
  private async register(@Body() createUserDto: SignDto): Promise<ResponseDto> {
    return this.authService.register(createUserDto)
  }

  @Post('login')
  @ApiCreatedResponse({
    type: ResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Wrong password',
  })
  private login(@Body() loginDto: SignDto): Promise<ResponseDto> {
    return this.authService.login(loginDto)
  }

  @Post('refresh')
  @ApiHeader({ name: 'refresh_token', required: true })
  @ApiCreatedResponse({
    type: RefreshResponseDto,
  })
  private refresh(
    @Headers('refresh_token') refreshToken: string,
  ): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshToken)
  }

  @Delete('logout')
  @HttpCode(204)
  @ApiHeader({ name: 'access_token', required: true })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({
    description: 'Invalid token',
  })
  private logout(@Headers('access_token') accessToken: string): Promise<void> {
    return this.authService.logout(accessToken)
  }

  @Delete('session/:id')
  @UseGuards(AdminGuard)
  @HttpCode(204)
  @ApiParam({ name: 'id', required: true })
  @ApiHeader({ name: 'access_token', required: true })
  @ApiNoContentResponse()
  private destroyUserSeesion(@Param('id') id: string): Promise<void> {
    return this.tokenService.destoyTokens(+id)
  }
}
