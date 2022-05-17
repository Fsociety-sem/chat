import { ApiProperty } from '@nestjs/swagger'
import { FriendStatus } from '@prisma/client'

export class RequestDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  userId: number

  @ApiProperty()
  friendId: number

  @ApiProperty({ enum: FriendStatus, default: FriendStatus.REQUESTED })
  status: FriendStatus
}
