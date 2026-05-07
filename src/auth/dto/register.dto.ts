import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
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

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  fullName: string;
}
