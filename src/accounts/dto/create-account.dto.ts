import { AccountType } from '@/database/entities/account.entity';
import { IsEnum, IsInt, IsNotEmpty, Length, Min } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  accountName: string;

  @IsNotEmpty()
  @IsEnum(AccountType)
  accountType: AccountType;

  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  balance: number;
}
