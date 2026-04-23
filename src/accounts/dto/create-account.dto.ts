import { IsEnum, IsInt, IsNotEmpty, Length, Min } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(['CHECKING', 'SAVINGS', 'CRYPTO'])
  type: 'CHECKING' | 'SAVINGS' | 'CRYPTO';

  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  balance: number;
}
