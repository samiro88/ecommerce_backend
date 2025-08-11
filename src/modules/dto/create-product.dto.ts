import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  designation: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  prix?: number = 10;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  promo?: number;

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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  subCategoryIds?: string[] = [];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  features?: any[] = [];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  nutritionalValues?: any[] = [];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  })
  variant?: any[] = [];

  @IsOptional()
  @IsString()
  codaBar?: string = '';

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  inStock?: boolean = false;

  price?: number;
  oldPrice?: number;
}
