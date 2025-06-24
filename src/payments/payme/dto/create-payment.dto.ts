import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @IsString()
  @IsNotEmpty()
  readonly order_id: string;

  @IsString()
  @IsNotEmpty()
  readonly note: string;

  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @IsString()
  @IsNotEmpty()
  readonly last_name: string;

  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @IsUrl()
  @IsNotEmpty()
  readonly return_url: string;

  @IsUrl()
  @IsNotEmpty()
  readonly cancel_url: string;

  @IsUrl()
  @IsNotEmpty()
  readonly webhook_url: string;
}