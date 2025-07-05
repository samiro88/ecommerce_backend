import { IsOptional, IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateVenteFlashDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  designation_fr: string;

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

  @IsNumber()
  @IsNotEmpty()
  prix: number;

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