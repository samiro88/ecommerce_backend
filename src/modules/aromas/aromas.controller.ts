
// --- aromas.controller.ts ---
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AromasService } from './aromas.service';
import { Aroma } from '../../models/aromas.schema';

@Controller('aromas')
export class AromasController {
  constructor(private readonly aromasService: AromasService) {}

  @Get()
  async findAll(): Promise<Aroma[]> {
    return this.aromasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Aroma> {
    return this.aromasService.findOne(id);
  }

  @Post()
  async create(@Body() data: Partial<Aroma>): Promise<Aroma> {
    return this.aromasService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Aroma>): Promise<Aroma> {
    return this.aromasService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.aromasService.remove(id);
  }

  // Get aromas for a brand
  @Get('/brand/:brandId')
  async findByBrand(@Param('brandId') brandId: string): Promise<Aroma[]> {
    return this.aromasService.findByBrand(brandId);
  }
}
