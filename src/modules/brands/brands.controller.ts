// --- brands.controller.ts ---
import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandsService } from './brands.service';
import { Brand } from '../../models/brands.schema';
import { Aroma } from '../../models/aromas.schema';
import * as path from 'path';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // This must come BEFORE @Get(':id')
 @Get()
async findAll(@Query('slug') slug?: string): Promise<Brand[]> {
  if (slug) {
    return this.brandsService.findBySlug(slug);
  }
  return this.brandsService.findAll();
}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Brand> {
    return this.brandsService.findOne(id);
  }
  @Post('admin/new-with-file')
  @UseInterceptors(FileInterceptor('file'))
  async adminCreateBrandWithFile(
    @Body() brandData: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      console.log('=== BRAND WITH FILE ENDPOINT HIT ===');
      console.log('Body received:', brandData);
      console.log('File received:', file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'No file');

      let imageUrl = '';
      
      // Upload file if provided
      if (file) {
        const now = new Date();
        const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
        
        const path = require('path');
        const dashboardPublicDir = path.join(
          process.cwd(), 
          '..', 
          '..', 
          'sobitas-dashboard', 
          'dashboard-app', 
          'public', 
          'brands', 
          monthYear
        );
        
        const fs = require('fs/promises');
        await fs.mkdir(dashboardPublicDir, { recursive: true });
        
        const ext = path.extname(file.originalname) || '.jpg';
        const baseName = path.basename(file.originalname, ext);
        const uniqueName = `${baseName}-${Date.now()}${ext}`;
        const filePath = path.join(dashboardPublicDir, uniqueName);
        
        await fs.writeFile(filePath, file.buffer);
        imageUrl = `/brands/${monthYear}/${uniqueName}`;
        
        console.log('File saved successfully:', {
          path: filePath,
          url: imageUrl
        });
      }
      
      // Create brand with form data and image URL
      const brandPayload = {
        ...brandData,
        logo: imageUrl || brandData.logo || ''
      };
      
      const result = await this.brandsService.create(brandPayload);
      console.log('Brand with file created successfully');
      
      return {
        success: true,
        message: 'Brand created successfully',
        imageUrl: imageUrl,
        brand: result
      };
    } catch (error) {
      console.error('Brand creation error:', error);
      throw error;
    }
  }

  @Post()
  async create(@Body() data: Partial<Brand>): Promise<Brand> {
    return this.brandsService.create(data);
  }
  @Put('admin/update-with-file/:id')
  @UseInterceptors(FileInterceptor('file'))
  async adminUpdateBrandWithFile(
    @Param('id') id: string,
    @Body() brandData: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      console.log('=== BRAND UPDATE WITH FILE ENDPOINT HIT ===');
      console.log('ID:', id);
      console.log('Body received:', brandData);
      console.log('File received:', file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'No file');

      let imageUrl = '';
      
      // Upload file if provided
      if (file) {
        const now = new Date();
        const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(' ', '');
        
        const dashboardPublicDir = path.join(
          process.cwd(), 
          '..', 
          '..', 
          'sobitas-dashboard', 
          'dashboard-app', 
          'public', 
          'brands', 
          monthYear
        );
        
        const fs = require('fs/promises');
        await fs.mkdir(dashboardPublicDir, { recursive: true });
        
        const ext = path.extname(file.originalname) || '.jpg';
        const baseName = path.basename(file.originalname, ext);
        const uniqueName = `${baseName}-${Date.now()}${ext}`;
        const filePath = path.join(dashboardPublicDir, uniqueName);
        
        await fs.writeFile(filePath, file.buffer);
        imageUrl = `/brands/${monthYear}/${uniqueName}`;
        
        console.log('File saved successfully:', {
          path: filePath,
          url: imageUrl
        });
      }
      
      // Update brand with form data and image URL
      const brandPayload = {
        ...brandData,
        logo: imageUrl || brandData.logo || ''
      };
      
      const result = await this.brandsService.update(id, brandPayload);
      console.log('Brand updated successfully');
      
      return {
        success: true,
        message: 'Brand updated successfully',
        imageUrl: imageUrl,
        brand: result
      };
    } catch (error) {
      console.error('Brand update error:', error);
      throw new HttpException(
        error.message || 'Update failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Brand>): Promise<Brand> {
    return this.brandsService.update(id, data);
  }
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.brandsService.remove(id);
  }

  // Set aromas for a brand (replace all)
  @Put(':id/aromas')
  async setAromas(@Param('id') id: string, @Body('aromaIds') aromaIds: string[]): Promise<Brand> {
    return this.brandsService.setAromas(id, aromaIds);
  }

  // Get aromas for a brand
  @Get(':id/aromas')
  async getAromas(@Param('id') id: string): Promise<Aroma[]> {
    return this.brandsService.getAromas(id);
  }
}
