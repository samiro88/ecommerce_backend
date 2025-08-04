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
} from '@nestjs/common';
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
}
