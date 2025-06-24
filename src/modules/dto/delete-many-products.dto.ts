import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteManyProductsDto {
  @IsArray()
  @IsNotEmpty()
  ids: string[];
}