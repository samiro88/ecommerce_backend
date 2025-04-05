import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  designation: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  oldPrice?: number;

  @IsOptional()
  @IsString()
  smallDescription?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  status?: boolean = true;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  venteflashDate?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  subCategoryIds?: string[] = [];

  @IsOptional()
  @IsArray()
  features?: any[] = [];

  @IsOptional()
  @IsArray()
  nutritionalValues?: any[] = [];

  @IsOptional()
  @IsArray()
  variant?: any[] = [];

  @IsOptional()
  @IsString()
  codaBar?: string = '';

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  inStock?: boolean = false;
}