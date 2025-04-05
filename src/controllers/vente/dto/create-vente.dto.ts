import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Decimal } from 'decimal.js';

class ClientDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone1?: string;
  @IsOptional() @IsString() phone2?: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() clientNote?: string;
}

class LivreurDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() cin?: string;
  @IsOptional() @IsString() carNumber?: string;
}

class VenteItemDto {
  @IsNotEmpty() @IsString() type: 'Product' | 'Pack';
  @IsNotEmpty() @IsString() itemId: string;
  @IsNotEmpty() quantity: number;
}

export class CreateVenteDto {
  @IsOptional() @IsString() createdAt?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => VenteItemDto) items: VenteItemDto[];
  @IsOptional() @IsString() clientId?: string;
  @IsOptional() @ValidateNested() @Type(() => ClientDto) client?: ClientDto;
  @IsOptional() @ValidateNested() @Type(() => LivreurDto) livreur?: LivreurDto;
  @IsOptional() @IsString() promoCode?: string;
  @IsOptional() @IsString() modePayment?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() note?: string;
  @IsOptional() livraison?: Decimal;
  @IsOptional() additionalCharges?: Decimal;
  @IsOptional() additionalDiscount?: Decimal;
  @IsOptional() @IsBoolean() isNewClient?: boolean;
}