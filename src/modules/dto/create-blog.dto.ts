import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  designation_fr?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsBoolean()
  inLandingPage?: boolean;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  showOnLandingPage?: boolean;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsString()
  publier?: string;

  @IsOptional()
  @IsString()
  alt_cover?: string;

  @IsOptional()
  @IsString()
  description_cover?: string;

  @IsOptional()
  @IsString()
  meta?: string;

  @IsOptional()
  @IsString()
  content_seo?: string;

  @IsOptional()
  @IsString()
  review?: string;

  @IsOptional()
  @IsString()
  aggregateRating?: string;
}