import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class SignDto {
  @ApiProperty({ example: 'Sam' })
  @MinLength(2)
  name: string

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(8)
  password: string
}
