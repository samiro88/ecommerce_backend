import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  designation: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value) || 10)
  prix?: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value) || 0)
  promo?: number = 0;

  @IsOptional()
  @IsString()
  smallDescription?: string = 'Description courte';

  @IsOptional()
  @IsString()
  brand?: string = '';

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean = true;

  @IsOptional()
  @IsString()
  description?: string = 'Description du produit';

  @IsOptional()
  @IsString()
  question?: string = '';

  @IsOptional()
  @IsString()
  venteflashDate?: string = '';

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
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
  @Transform(({ value }) => value === 'true' || value === true)
  inStock?: boolean = true;

  // Legacy field support
  price?: number;
  oldPrice?: number;
}
