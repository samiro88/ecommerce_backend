
import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateSubCategoryDto {
  @IsNotEmpty()
  @IsString()
  designation: string;

  @IsOptional()
  @IsString()
  designation_fr?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  // Accept both ObjectId and string for category reference
  @IsNotEmpty()
  @IsString()
  categoryId: string;

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
