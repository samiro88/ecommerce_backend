import { PartialType } from '@nestjs/mapped-types';
import { CreateVenteFlashDto } from './create-vente-flash.dto';

export class UpdateVenteFlashDto extends PartialType(CreateVenteFlashDto) {
  // All fields are optional due to PartialType
  // Add any update-specific validations if needed
}