import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSeoPageDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly page: string;

  @IsString()
  @IsOptional()
  readonly meta?: string;

  @IsString()
  @IsOptional()
  readonly description_fr?: string;

  @IsString()
  @IsOptional()
  readonly nutrition_values?: string;

  @IsString()
  @IsOptional()
  readonly questions?: string;

  @IsString()
  @IsOptional()
  readonly zone1?: string;

  @IsString()
  @IsOptional()
  readonly zone2?: string;

  @IsString()
  @IsOptional()
  readonly zone3?: string;

  @IsString()
  @IsOptional()
  readonly more_details?: string;

  @IsString()
  @IsOptional()
  readonly created_at?: string;

  @IsString()
  @IsOptional()
  readonly updated_at?: string;
}
