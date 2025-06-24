import { Controller, Get, Post, Delete, Patch, Param, UploadedFile, Body, UseInterceptors , NotFoundException  } from '@nestjs/common';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createCategory(@UploadedFile() file: Express.Multer.File, @Body('designation') designation: string) {
    return this.categoryService.createCategory(file, designation);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updateCategory(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body('designation') designation: string) {
    return this.categoryService.updateCategory(id, file, designation);
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }
  
  @Get('slug/:slug')
async getCategoryBySlug(@Param('slug') slug: string) {
  try {
    const category = await this.categoryService.getCategoryBySlug(slug);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  } catch (error) {
    throw new NotFoundException('Category not found');
  }
}

}