import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SubCategoriesService } from './subcategories.service';

@Controller('subcategories')
export class PublicSubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Get('slug/:slug')
  async getSubCategoryBySlug(@Param('slug') slug: string) {
    try {
      const subcategory = await this.subCategoriesService.getSubCategoryBySlug(slug);
      if (!subcategory) {
        throw new HttpException('Subcategory not found', HttpStatus.NOT_FOUND);
      }
      return subcategory;
    } catch (error) {
      throw new HttpException(
        'Subcategory not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}