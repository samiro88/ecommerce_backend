import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryDto {

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  
  @IsOptional()
  @IsString()
  brand?: string;
  
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string = '-createdAt';

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  status?: boolean = true;

  @IsOptional()
  @IsString()
  promo?: string;


  @IsOptional()
@IsString()
sous_categorie_id?: string;


}

