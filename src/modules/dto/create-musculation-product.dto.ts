
import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';

export class CreateMusculationProductDto {
  @IsObject()
  @IsOptional()
  _id?: {
    $oid: string;
  };

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  sous_categorie_id?: string;

  @IsString()
  @IsOptional()
  designation_fr?: string;

  @IsString()
  @IsOptional()
  cover?: string;

  @IsString()
  @IsOptional()
  qte?: string;

  @IsString()
  @IsOptional()
  prix_ht?: string;

  @IsString()
  @IsOptional()
  prix?: string;

  @IsString()
  @IsOptional()
  promo_ht?: string;

  @IsString()
  @IsOptional()
  promo?: string;

  @IsString()
  @IsOptional()
  description_fr?: string;

  @IsString()
  @IsOptional()
  publier?: string;

  @IsString()
  @IsOptional()
  created_by?: string;

  @IsString()
  @IsOptional()
  updated_by?: string;

  @IsString()
  @IsOptional()
  created_at?: string;

  @IsString()
  @IsOptional()
  updated_at?: string;

  @IsString()
  @IsOptional()
  code_product?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  pack?: string;

  @IsString()
  @IsOptional()
  brand_id?: string;

  @IsString()
  @IsOptional()
  new_product?: string;

  @IsString()
  @IsOptional()
  best_seller?: string;

  @IsString()
  @IsOptional()
  gallery?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  meta_description_fr?: string;

  @IsString()
  @IsOptional()
  promo_expiration_date?: string;

  @IsString()
  @IsOptional()
  rupture?: string;

  @IsString()
  @IsOptional()
  alt_cover?: string;

  @IsString()
  @IsOptional()
  description_cover?: string;

  @IsString()
  @IsOptional()
  meta?: string;

  @IsString()
  @IsOptional()
  content_seo?: string;

  @IsString()
  @IsOptional()
  review?: string;

  @IsString()
  @IsOptional()
  aggregateRating?: string;

  @IsString()
  @IsOptional()
  nutrition_values?: string;

  @IsString()
  @IsOptional()
  questions?: string;

  @IsString()
  @IsOptional()
  zone1?: string;

  @IsString()
  @IsOptional()
  zone2?: string;

  @IsString()
  @IsOptional()
  zone3?: string;

  @IsString()
  @IsOptional()
  zone4?: string;

  // Optional fields for articles
  @IsString()
  @IsOptional()
  categorie_id?: string;
  
  @IsString()
  @IsOptional()
  description?: string;
  
  @IsString()
  @IsOptional()
  more_details?: string;
}
