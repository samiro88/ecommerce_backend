// src/category/dto/create-category.dto.ts
export class CreateCategoryDto {
    readonly name: string;
    readonly description?: string;
    readonly schema_description?: string; 
  }