import { IsNotEmpty, IsString } from 'class-validator';

export class ValidatePromoCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}