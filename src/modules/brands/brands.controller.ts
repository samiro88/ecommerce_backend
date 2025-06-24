// --- brands.controller.ts ---
import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Brand } from '../../models/brands.schema';
import { Aroma } from '../../models/aromas.schema';

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
  @Post()
  async create(@Body() data: Partial<Brand>): Promise<Brand> {
    return this.brandsService.create(data);
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
