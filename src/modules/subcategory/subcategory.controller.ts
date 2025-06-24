
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { SubCategoriesService } from './subcategory.service';
import { CreateSubCategoryDto } from '../dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from '../dto/update-sub-category.dto';

@Controller('sub-categories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Post()
  async create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return this.subCategoriesService.create(createSubCategoryDto);
  }
  @Get()
  async findAll() {
    return this.subCategoriesService.findAll();
  }
  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.subCategoriesService.findByCategory(categoryId);
  }
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    // You need to implement findBySlug in your service if you want this
    if (typeof this.subCategoriesService['findBySlug'] === 'function') {
      return this.subCategoriesService['findBySlug'](slug);
    }
    throw new NotFoundException('Not implemented');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    return this.subCategoriesService.update(id, updateSubCategoryDto);
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.subCategoriesService.remove(id);
  }
  @Get(':id')
async findOne(@Param('id') id: string) {
  return this.subCategoriesService.findOne(id);
}
}


