import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  password: string;
}
