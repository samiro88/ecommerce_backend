import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNewsletterDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsOptional()
  readonly created_at?: string;

  @IsString()
  @IsOptional()
  readonly updated_at?: string;
}
