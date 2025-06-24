import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateVenteFlashDto {
  @IsString()
  @IsNotEmpty()
  id: string; // "59"

  @IsString()
  @IsNotEmpty()
  designation_fr: string; // "Parapharmacie en ligne..."

  @IsString()
  @IsOptional()
  cover?: string; // "articles/February2025/AL1Yaro8oxaQ0vW8RE4T.webp"

  @IsString()
  @IsOptional()
  description?: string; // HTML content

  @IsString()
  @IsOptional()
  publier?: string = "1"; // Default to "1" (published)

  @IsString()
  @IsOptional()
  meta_description_fr?: string | null;

  @IsString()
  @IsNotEmpty()
  slug: string; // "parapharmacie-en-ligne..."

  @IsString()
  @IsOptional()
  alt_cover?: string | null;

  @IsString()
  @IsOptional()
  description_cover?: string | null;

  @IsString({ each: true })
  @IsOptional()
  products?: string[]; // Array of product IDs ("12", etc.)
}