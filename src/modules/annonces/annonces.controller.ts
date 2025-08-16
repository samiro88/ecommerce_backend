import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Put,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AnnoncesService } from './annonces.service';
import { CreateAnnonceDto } from '../dto/create-annonce.dto';
import { UpdateAnnonceDto } from '../dto/update-annonce.dto';

@Controller('annonces')
export class AnnoncesController {
  constructor(private readonly annoncesService: AnnoncesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createAnnonceDto: CreateAnnonceDto) {
    return this.annoncesService.create(createAnnonceDto);
  }

  @Get()
  async findAll() {
    return this.annoncesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.annoncesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() updateAnnonceDto: UpdateAnnonceDto) {
    return this.annoncesService.update(id, updateAnnonceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.annoncesService.remove(id);
    return;
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image_1', maxCount: 1 },
    { name: 'image_2', maxCount: 1 },
    { name: 'image_3', maxCount: 1 },
    { name: 'image_4', maxCount: 1 },
    { name: 'image_5', maxCount: 1 },
    { name: 'image_6', maxCount: 1 },
    { name: 'products_default_cover', maxCount: 1 },
  ]))
  async updateWithFiles(
    @Param('id') id: string, 
    @Body() updateAnnonceDto: any,
    @UploadedFiles() files?: any
  ) {
    return this.annoncesService.updateWithFiles(id, updateAnnonceDto, files);
  }
}
