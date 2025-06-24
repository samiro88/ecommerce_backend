import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class SendWhatsAppDto {
    @IsPhoneNumber()
    to: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
