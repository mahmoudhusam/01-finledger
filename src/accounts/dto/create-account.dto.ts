import { AccountType } from '@/database/entities/account.entity';
import { IsEnum, IsNotEmpty, IsString, Length, Min } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  accountName: string;

  @IsNotEmpty()
  @IsEnum(AccountType)
  accountType: AccountType;

  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @Min(0)
  balance: number;
}
