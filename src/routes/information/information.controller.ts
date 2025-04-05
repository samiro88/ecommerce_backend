import { Controller, Get, Put, Delete, Post, Param, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InformationService } from './information.service';
import { UpdateGeneralDto } from './dto/update-general.dto';
import { UpdateAdvancedDto } from './dto/update-advanced.dto';
import { UpdateMaterielDto } from './dto/update-materiel.dto';
import { UpdateSlidesDto } from './dto/update-slides.dto';
import { UpdateBrandsDto } from './dto/update-brands.dto';
import * as DTOs from './dto';

@Controller('information')
export class InformationController {
  constructor(private readonly informationService: InformationService) {}

  @Get('general/get')
  getGeneralData() {
    return this.informationService.getGeneralData();
  }

  @Put('general/update')
  @UseInterceptors(FileInterceptor('logo'))
  updateGeneralInformation(@UploadedFile() file: Express.Multer.File, @Body() updateGeneralDto: DTOs.UpdateGeneralDto) {
    return this.informationService.updateGeneralInformation(file, updateGeneralDto);
  }

  @Get('advanced/get')
  getAdvancedData() {
    return this.informationService.getAdvancedData();
  }

  @Put('advanced/update')
  updateAdvancedInformation(@Body() updateAdvancedDto: DTOs.UpdateAdvancedDto) {
    return this.informationService.updateAdvancedInformation(updateAdvancedDto);
  }

  @Get('get/information')
  getInformation() {
    return this.informationService.getInformation();
  }

  @Get('homepage/get/materielimage')
  getMaterielImageSection() {
    return this.informationService.getMaterielImageSection();
  }

  @Put('homepage/update/materielimage')
  @UseInterceptors(FileInterceptor('image'))
  updateMaterielImageSection(@UploadedFile() file: Express.Multer.File, @Body() updateMaterielDto: DTOs.UpdateMaterielDto) {
    return this.informationService.updateMaterielImageSection(file, updateMaterielDto);
  }

  @Delete('homepage/delete/materielimage')
  deleteMaterielImageSection() {
    return this.informationService.deleteMaterielImageSection();
  }
}
