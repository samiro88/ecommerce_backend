import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsOptional()
  readonly id?: string;

  @IsString()
  @IsOptional()
  readonly designation_fr?: string;

  @IsString()
  @IsOptional()
  readonly description_fr?: string;

  @IsString()
  @IsOptional()
  readonly icon?: string;

  @IsString()
  @IsOptional()
  readonly created_at?: string;

  @IsString()
  @IsOptional()
  readonly updated_at?: string;
}
