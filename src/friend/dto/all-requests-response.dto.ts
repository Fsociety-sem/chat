import { ApiProperty } from '@nestjs/swagger'
import { UserStatus } from 'src/user/status.enum'

class Name {
  @ApiProperty()
  name: string
}

class Request {
  @ApiProperty()
  id: string

  @ApiProperty({ type: Name })
  user: Name

  @ApiProperty({ type: Name })
  friend: Name
}

class Friend extends Request {
  @ApiProperty({ enum: UserStatus })
  friendStatus: UserStatus
}

export class AllRequestsResponseDto {
  @ApiProperty({ type: [Request] })
  incoming: Request[]

  @ApiProperty({ type: [Request] })
  outcoming: Request[]

  @ApiProperty({ type: [Friend] })
  friends: Friend[]
}
