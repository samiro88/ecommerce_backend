import { PartialType } from '@nestjs/mapped-types';
import { CreateSystemMessageDto } from './create-system-message.dto';

export class UpdateSystemMessageDto extends PartialType(CreateSystemMessageDto) {}
