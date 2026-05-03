import { IsNotEqualToConstraint } from '@/common/decorators/notEqualToConstraint.decorator';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Validate } from 'class-validator';

export class CreateTransferDto {
  @IsNotEmpty()
  @IsInt()
  fromAccountId: number;

  @IsNotEmpty()
  @IsInt()
  @Validate(IsNotEqualToConstraint, ['fromAccountId'])
  toAccountId: number;

  @IsInt()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  note?: string;
}
