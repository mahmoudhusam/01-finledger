import { IsNotEqualToConstraint } from '@/common/decorators/notEqualToConstraint.decorator';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    description: 'The ID of the account to transfer from',
    example: 1,
  })
  fromAccountId: number;

  @IsNotEmpty()
  @IsInt()
  @Validate(IsNotEqualToConstraint, ['fromAccountId'])
  @ApiProperty({
    description: 'The ID of the account to transfer to',
    example: 2,
  })
  toAccountId: number;

  @IsInt()
  @Min(1)
  @ApiProperty({
    description: 'The amount to transfer in cents (e.g., 5000 for $50.00)',
    example: 5000,
  })
  amount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The currency of the transfer',
    example: 'USD',
  })
  currency: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'A note about the transfer',
    example: 'Monthly salary transfer',
    required: false,
  })
  note?: string;
}
