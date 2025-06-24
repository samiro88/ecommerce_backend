import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsBoolean()
  inLandingPage?: boolean;

  @IsOptional()
  @IsString()
  cover?: string; // <-- Add this line
}