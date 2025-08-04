import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly designation_fr: string;

  @IsString()
  @IsNotEmpty()
  readonly description_fr: string;

  @IsString()
  @IsNotEmpty()
  readonly icon: string;

  @IsString()
  @IsOptional()
  readonly created_at?: string;

  @IsString()
  @IsOptional()
  readonly updated_at?: string;
}
