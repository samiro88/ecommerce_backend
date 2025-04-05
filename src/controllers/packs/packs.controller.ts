import {
    Controller,
    Post,
    Put,
    Delete,
    Get,
    Param,
    Query,
    Body,
    UploadedFiles,
    UseInterceptors,
  } from '@nestjs/common';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { PacksService } from './packs.service';
  
  @Controller('packs')
  export class PacksController {
    constructor(private readonly packsService: PacksService) {}
  
    @Post()
    @UseInterceptors(FilesInterceptor('files'))
    async createPack(
      @Body() body: any,
      @UploadedFiles() files: { mainImage?: any[]; images?: any[] },
    ) {
      return this.packsService.createPack(body, files);
    }
  
    @Put(':id')
    @UseInterceptors(FilesInterceptor('files'))
    async updatePack(
      @Param('id') id: string,
      @Body() body: any,
      @UploadedFiles() files: { mainImage?: any[]; images?: any[] },
    ) {
      return this.packsService.updatePack(id, body, files);
    }
  
    @Delete(':id')
    async deletePack(@Param('id') id: string) {
      return this.packsService.deletePack(id);
    }
  
    @Get()
    async getPackList(
      @Query('page') page: string,
      @Query('limit') limit: string,
      @Query('minPrice') minPrice: string,
      @Query('maxPrice') maxPrice: string,
      @Query('inStock') inStock: string,
      @Query('sort') sort: string,
    ) {
      return this.packsService.getPackList({
        page,
        limit,
        minPrice,
        maxPrice,
        inStock,
        sort,
      });
    }
  
    @Get('all')
    async getAllPacks() {
      return this.packsService.getAllPacks();
    }
  
    @Get(':id')
    async getPackById(@Param('id') id: string) {
      return this.packsService.getPackById(id);
    }
  
    @Delete('bulk')
    async deletePacksInBulk(@Body() body: string[]) {
      return this.packsService.deletePacksInBulk(body);
    }
  
    @Get('slug/:slug')
    async getPackBySlug(@Param('slug') slug: string) {
      return this.packsService.getPackBySlug(slug);
    }
  
    @Get('promo/packs')
    async getPacksWithPromo() {
      return this.packsService.getPacksWithPromo();
    }
  
    @Get('promo/top')
    async getPacksWithTopPromo() {
      return this.packsService.getPacksWithTopPromo();
    }
  }