// src/category/controllers/category.controller.ts
import {
    Controller, Post, Delete, Put, Get,
    Param, Body, UploadedFile, UseInterceptors
  } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { categoryMulterOptions } from './config/category-multer.config';
  
  
  @Controller('category')
  export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}
  
    @Post('new')
    @UseInterceptors(FileInterceptor('image', categoryMulterOptions))
    async create(
      @Body() createDto: CreateCategoryDto,
      @UploadedFile() image: Express.Multer.File
    ) {
      return this.categoryService.createCategory(createDto, image);
    }
  
    @Delete('delete/:id')
    async delete(@Param('id') id: string) {
      return this.categoryService.deleteCategory(parseInt(id));
    }
  
    @Put('update/:id')
    @UseInterceptors(FileInterceptor('image', categoryMulterOptions))
    async update(
      @Param('id') id: string,
      @Body() updateDto: UpdateCategoryDto,
      @UploadedFile() image?: Express.Multer.File
    ) {
      return this.categoryService.updateCategory(parseInt(id), updateDto, image);
    }
  
    @Get('get/all')
    async getAll() {
      return this.categoryService.getAllCategories();
    }
  
    @Get('get/:id')
    async getById(@Param('id') id: string) {
      return this.categoryService.getCategoryById(parseInt(id));
    }
  }