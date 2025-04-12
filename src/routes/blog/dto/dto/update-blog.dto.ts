import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from '../create-blog.dto'; // Adjust the relative path accordingly

import { IsString, IsOptional } from 'class-validator';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsString()
  @IsOptional()
  cover?: string;

  @IsOptional()
  removedImages?: string[];
}