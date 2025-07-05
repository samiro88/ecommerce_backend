import { PartialType } from '@nestjs/mapped-types';
import { CreateVenteFlashDto } from './create-vente-flash.dto';

export class UpdateVenteFlashDto extends PartialType(CreateVenteFlashDto) {}