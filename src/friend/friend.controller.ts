import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { AuthGuard } from 'src/auth/guards/auth.guard'
import { AllRequestsResponseDto } from './dto/all-requests-response.dto'
import { RequestDto } from './dto/request-response.dto'
import { FriendService } from './friend.service'

@Controller('friend')
@UseGuards(AuthGuard)
@ApiTags('Friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('request/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the user you want to add as a friend',
  })
  @ApiHeader({ name: 'access_token', required: true })
  @ApiCreatedResponse({
    type: RequestDto,
  })
  @ApiBadRequestResponse({
    description: 'You cannot add yourself as friend',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid token',
  })
  @ApiConflictResponse({
    description: 'Friend request already exists',
  })
  private requestFriendship(
    @Param('id') id: string,
    @Headers('access_token') accessToken: string,
  ): Promise<RequestDto> {
    return this.friendService.requestFriendship(accessToken, +id)
  }

  @Get('request')
  @ApiHeader({ name: 'access_token', required: true })
  @ApiOkResponse({
    type: AllRequestsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid token',
  })
  private getRequests(
    @Headers('access_token') accessToken: string,
  ): Promise<AllRequestsResponseDto> {
    return this.friendService.getRequests(accessToken)
  }

  @Patch('accept/:id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Request id',
  })
  @ApiHeader({ name: 'access_token', required: true })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({
    description: 'Invalid token',
  })
  @ApiForbiddenResponse()
  private acceptRequest(
    @Param('id') id: string,
    @Headers('access_token') accessToken: string,
  ): Promise<void> {
    return this.friendService.acceptRequest(accessToken, id)
  }

  @Delete(':id')
  @ApiHeader({ name: 'access_token', required: true })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({
    description: 'Invalid token',
  })
  @ApiForbiddenResponse()
  private deleteFriend(
    @Param('id') id: string,
    @Headers('access_token') accessToken: string,
  ): Promise<void> {
    return this.friendService.deleteFriend(accessToken, id)
  }
}
