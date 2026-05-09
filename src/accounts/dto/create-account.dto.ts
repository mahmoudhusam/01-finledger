import { AccountType } from '@/database/entities/account.entity';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the account',
    example: 'John Doe Savings Account',
  })
  accountName: string;

  @IsNotEmpty()
  @IsEnum(AccountType)
  @ApiProperty({
    description: 'The type of the account',
    example: AccountType.SAVINGS,
  })
  accountType: AccountType;

  @IsNotEmpty()
  @Length(3, 3)
  @ApiProperty({
    description: 'The currency of the account',
    example: 'USD',
  })
  currency: string;
}
