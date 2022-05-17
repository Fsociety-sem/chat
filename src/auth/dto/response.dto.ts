import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@prisma/client'

import { ITokens } from 'src/token/interfaces/tokens.interface'

export class UserResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty({ enum: Role, isArray: true })
  roles: Role[]
}

export class ResponseDto {
  @ApiProperty()
  user: UserResponseDto

  @ApiProperty()
  tokens: ITokens
}
