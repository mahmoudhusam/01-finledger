import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWebhookDepositDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: 'The amount to transfer in cents (e.g., 5000 for $50.00)',
    example: 5000,
  })
  amount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The currency of the deposit',
    example: 'USD',
  })
  currency: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: 'The ID of the account to deposit to',
    example: 1,
  })
  toAccountId: number;
}
