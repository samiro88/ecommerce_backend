import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  designation_fr?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsBoolean()
  inLandingPage?: boolean;

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