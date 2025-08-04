import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSystemMessageDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString() @IsOptional() readonly msg_welcome?: string;
  @IsString() @IsOptional() readonly msg_etat_commande?: string;
  @IsString() @IsOptional() readonly msg_passez_commande?: string;
  @IsString() @IsOptional() readonly created_at?: string;
  @IsString() @IsOptional() readonly updated_at?: string;
}
