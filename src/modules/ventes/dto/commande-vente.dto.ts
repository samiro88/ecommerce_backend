import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVenteDto } from './create-vente.dto';  


class CommandeItemDto {
  @IsNotEmpty() @IsString() type: 'Product' | 'Pack';
  @IsNotEmpty() @IsString() slug: string;
  @IsNotEmpty() quantity: number;
}

export class CommandeVenteDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => CommandeItemDto) items: CommandeItemDto[];
  @IsNotEmpty() @ValidateNested() @Type(() => CreateVenteDto['client']) client: CreateVenteDto['client'];
  @IsOptional() @ValidateNested() @Type(() => CreateVenteDto['livreur']) livreur?: CreateVenteDto['livreur'];
  @IsOptional() @IsString() promoCode?: string;
  @IsOptional() @IsString() modePayment?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() note?: string;
  @IsOptional() livraison?: number;
  @IsOptional() additionalCharges?: number;
  @IsOptional() additionalDiscount?: number;
}