import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UploadedFiles,
    UseInterceptors,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { PacksService } from './packs.service';
  
  @Controller('admin/packs') // Maintaining /admin prefix from original
  export class PacksController {
    constructor(private readonly packsService: PacksService) {}
  
    @Post('new')
    @UseInterceptors(FilesInterceptor('images', 10)) // Same 10 file limit as original
    async createPack(
      @Body() body: any,
      @UploadedFiles() files: Express.Multer.File[],
    ) {
      try {
        return await this.packsService.createPack(body, files);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get')
    async getPackList(@Query() query: any) {
      try {
        return await this.packsService.getPackList(query);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/all')
    async getAllPacks() {
      try {
        return await this.packsService.getAllPacks();
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/:id')
    async getPackById(@Param('id') id: string) {
      try {
        return await this.packsService.getPackById(id);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Delete('delete/:id')
    async deletePack(@Param('id') id: string) {
      try {
        return await this.packsService.deletePack(id);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Post('delete/many')
    async deletePacksInBulk(@Body() body: string[]) {
      try {
        return await this.packsService.deletePacksInBulk(body);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Put('update/:id')
    @UseInterceptors(FilesInterceptor('images', 10))
    async updatePack(
      @Param('id') id: string,
      @Body() body: any,
      @UploadedFiles() files: Express.Multer.File[],
    ) {
      try {
        return await this.packsService.updatePack(id, body, files);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/store/packs/get-by-slug/:slug')
    async getPackBySlug(@Param('slug') slug: string) {
      try {
        return await this.packsService.getPackBySlug(slug);
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('get/store/get/top-promotion-packs')
    async getPacksWithPromo() {
      try {
        return await this.packsService.getPacksWithPromo();
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }