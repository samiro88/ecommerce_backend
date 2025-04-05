import {
    Controller,
    Post,
    Delete,
    Put,
    Get,
    Param,
    Body,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { SubCategoriesService } from './subcategories.service';
  
  @Controller('admin/subcategories') // Maintaining /admin prefix
  export class SubCategoriesController {
    constructor(private readonly subCategoriesService: SubCategoriesService) {}
  
    @Post('new')
    async createSubCategory(@Body() body: any) {
      try {
        return await this.subCategoriesService.createSubCategory(body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Delete('delete/:id')
    async deleteSubCategory(@Param('id') id: string) {
      try {
        return await this.subCategoriesService.deleteSubCategory(id);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Put('update/:id')
    async updateSubCategory(@Param('id') id: string, @Body() body: any) {
      try {
        return await this.subCategoriesService.updateSubCategory(id, body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/by-category/:categoryId')
    async getSubCategoriesByCategory(@Param('categoryId') categoryId: string) {
      try {
        return await this.subCategoriesService.getSubCategoriesByCategory(categoryId);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/all')
    async getAllSubCategories() {
      try {
        return await this.subCategoriesService.getAllSubCategories();
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }