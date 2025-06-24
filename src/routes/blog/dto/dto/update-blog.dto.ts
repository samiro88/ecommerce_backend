import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from '../../../../modules/dto/create-blog.dto';

import { IsString, IsOptional } from 'class-validator';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsString()
  @IsOptional()
  cover?: string;

  @IsOptional()
  removedImages?: string[];
}