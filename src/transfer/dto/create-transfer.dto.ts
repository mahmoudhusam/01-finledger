import { IsNotEqualToConstraint } from '@/common/decorators/notEqualToConstraint.decorator';
import { IsInt, IsNotEmpty, Validate } from 'class-validator';

export class CreateTransferDto {
  @IsNotEmpty()
  @IsInt()
  fromAccountId: number;

  @IsNotEmpty()
  @IsInt()
  @Validate(IsNotEqualToConstraint, ['fromAccountId'])
  toAccountId: number;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsNotEmpty()
  currency: string;

  note?: string;
}
