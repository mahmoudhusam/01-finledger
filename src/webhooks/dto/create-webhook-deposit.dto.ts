import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateWebhookDepositDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  toAccountId: number;
}
