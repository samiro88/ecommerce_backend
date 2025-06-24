import { IsOptional, IsString } from 'class-validator';

export class UpdateSubCategoryDto {
  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  designation_fr?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  categorie_id?: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsString()
  alt_cover?: string;

  @IsOptional()
  @IsString()
  description_cove?: string;

  @IsOptional()
  @IsString()
  meta?: string;

  @IsOptional()
  @IsString()
  content_seo?: string;

  @IsOptional()
  @IsString()
  description_fr?: string;

  @IsOptional()
  @IsString()
  review?: string;

  @IsOptional()
  @IsString()
  aggregateRating?: string;

  @IsOptional()
  @IsString()
  nutrition_values?: string;

  @IsOptional()
  @IsString()
  questions?: string;

  @IsOptional()
  @IsString()
  more_details?: string;

  @IsOptional()
  @IsString()
  zone1?: string;

  @IsOptional()
  @IsString()
  zone2?: string;

  @IsOptional()
  @IsString()
  zone3?: string;

  @IsOptional()
  @IsString()
  zone4?: string;
}
