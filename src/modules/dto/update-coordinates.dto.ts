import { PartialType } from '@nestjs/mapped-types';
import { CreateCoordinatesDto } from './create-coordinates.dto';

export class UpdateCoordinatesDto extends PartialType(CreateCoordinatesDto) {}
