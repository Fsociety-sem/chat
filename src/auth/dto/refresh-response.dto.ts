import { ApiProperty } from '@nestjs/swagger'

export class RefreshResponseDto {
  @ApiProperty()
  access: string

  @ApiProperty()
  refresh: string
}
