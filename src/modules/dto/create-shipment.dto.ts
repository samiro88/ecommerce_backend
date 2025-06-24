import { IsNotEmpty, ValidateNested, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsNotEmpty()
  line1: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  countryCode: string;
}

class ContactDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  email: string;
}

class DimensionsDto {
  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;
}

export class CreateShipmentDto {
  @ValidateNested()
  @Type(() => AddressDto)
  shipperAddress: AddressDto;

  @ValidateNested()
  @Type(() => ContactDto)
  shipperContact: ContactDto;

  @ValidateNested()
  @Type(() => AddressDto)
  consigneeAddress: AddressDto;

  @ValidateNested()
  @Type(() => ContactDto)
  consigneeContact: ContactDto;

  @IsNotEmpty()
  description: string;

  @IsIn(['DOM', 'EXP'])
  productGroup: string;

  @IsIn(['PDX', 'ONP'])
  productType: string;

  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto;

  @IsNumber()
  weight: number;

  @IsNotEmpty()
  originCountry: string;
}