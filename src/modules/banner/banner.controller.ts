import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { BannerService } from './banner.service';

@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  async create(@Body() data: any) {
    return this.bannerService.create(data);
  }

  @Post('bulk')
  async createMany(@Body() banners: any[]) {
    return this.bannerService.createMany(banners);
  }

  @Get()
  async findAll(@Query() filter: any = {}) {
    return this.bannerService.findAll(filter);
  }

  @Get('count')
  async count(@Query() filter: any = {}) {
    return this.bannerService.count(filter);
  }

  @Get('find')
  async findOneByFields(@Query() fields: any) {
    return this.bannerService.findOneByFields(fields);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bannerService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.bannerService.update(id, data);
  }

  @Put()
  async updateMany(@Query() filter: any, @Body() update: any): Promise<any> {
    return this.bannerService.updateMany(filter, update);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bannerService.remove(id);
  }

  @Delete()
  async removeMany(@Query() filter: any): Promise<any> {
    return this.bannerService.removeMany(filter);
  }
}