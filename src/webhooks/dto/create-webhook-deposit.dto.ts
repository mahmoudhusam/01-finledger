import { IsNotEmpty } from 'class-validator';

export class CreateWebhookDepositDto {
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  currency: string;

  @IsNotEmpty()
  toAccountId: number;

  @IsNotEmpty()
  signature: string;
}
