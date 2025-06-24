import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class SendSmsDto {
    @IsPhoneNumber()
    to: string;
  @IsString()
  @IsNotEmpty()
  message: string;
}
