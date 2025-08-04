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
import { SeoPagesService } from './seo-pages.service';
import { CreateSeoPageDto } from '../dto/create-seo-page.dto';
import { UpdateSeoPageDto } from '../dto/update-seo-page.dto';

@Controller('seo-pages')
export class SeoPagesController {
  constructor(private readonly seoPagesService: SeoPagesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createSeoPageDto: CreateSeoPageDto) {
    return this.seoPagesService.create(createSeoPageDto);
  }

  @Get()
  async findAll() {
    return this.seoPagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.seoPagesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() updateSeoPageDto: UpdateSeoPageDto) {
    return this.seoPagesService.update(id, updateSeoPageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.seoPagesService.remove(id);
    return;
  }
}
