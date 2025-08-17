import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateVenteFlashDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  designation_fr?: string;

  @IsString()
  @IsOptional()
  cover?: string;

  @IsString()
  @IsOptional()
  new_product?: string;

  @IsString()
  @IsOptional()
  best_seller?: string;

  @IsNumber()
  @IsOptional()
  note?: number;

  @IsString()
  @IsOptional()
  alt_cover?: string | null;

  @IsString()
  @IsOptional()
  description_cover?: string | null;

  @IsOptional()
  @IsNumber()
  prix?: number;

  @IsString()
  @IsOptional()
  pack?: string;

  @IsNumber()
  @IsOptional()
  promo?: number;

  @IsString()
  @IsOptional()
  promo_expiration_date?: string;
}