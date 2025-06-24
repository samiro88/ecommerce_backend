// information.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Query,
    Body,
    UploadedFiles,
    UploadedFile,
    UseInterceptors,
    Param,
  } from '@nestjs/common';
  import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
  import { InformationService } from './information.service';
  
  @Controller('information')
  export class InformationController {
    constructor(private readonly informationService: InformationService) {}
  
    @Get()
    async getInformation() {
      return this.informationService.getInformation();
    }
  
    @Get('general')
    async getGeneralData() {
      return this.informationService.getGeneralData();
    }
  
    @Put('general')
    @UseInterceptors(FileInterceptor('file'))
    async updateGeneralInformation(
      @Body() body: any,
      @UploadedFile() file: Express.Multer.File,
    ) {
      return this.informationService.updateGeneralInformation(body, file);
    }
  
    @Get('advanced')
    async getAdvancedData() {
      return this.informationService.getAdvancedData();
    }
  
    @Put('advanced')
    async updateAdvancedInformation(@Body() body: any) {
      return this.informationService.updateAdvancedInformation(body);
    }
  
    @Put('materiel-image')
    @UseInterceptors(FileInterceptor('file'))
    async updateMaterielImageSection(@UploadedFile() file: Express.Multer.File) {
      return this.informationService.updateMaterielImageSection(file);
    }
  
    @Delete('materiel-image')
    async deleteMaterielImageSection() {
      return this.informationService.deleteMaterielImageSection();
    }
  
    @Get('materiel-image')
    async getMaterielImageSection() {
      return this.informationService.getMaterielImageSection();
    }
  
    @Get('slides')
    async getAllSlides() {
      return this.informationService.getAllSlides();
    }
  
    @Post('slides')
    @UseInterceptors(FilesInterceptor('images', 25))
    async addSlideImages(@UploadedFiles() files: Express.Multer.File[]) {
      return this.informationService.addSlideImages(files);
    }
  
    @Delete('slides/:imgId')
    async deleteSlideImage(@Param('imgId') imgId: string) {
      return this.informationService.deleteSlideImage(imgId);
    }
  
    @Put('slides/order')
    async updateSlidesOrder(@Body() body: { slides: any[] }) {
      return this.informationService.updateSlidesOrder(body.slides);
    }
  
    @Get('brands')
    async getAllBrands() {
      return this.informationService.getAllBrands();
    }
  
    @Post('brands')
    @UseInterceptors(FilesInterceptor('images'))
    async addBrandImages(@UploadedFiles() files: Express.Multer.File[]) {
      return this.informationService.addBrandImages(files);
    }
  
    @Delete('brands/:imgId')
    async deleteBrandImage(@Param('imgId') imgId: string) {
      return this.informationService.deleteBrandImage(imgId);
    }
  
    @Put('brands/order')
    async updateBrandsOrder(@Body() body: { brands: any[] }) {
      return this.informationService.updateBrandsOrder(body.brands);
    }
  }