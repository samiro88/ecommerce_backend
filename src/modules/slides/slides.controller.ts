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
import { SlidesService } from './slides.service';
import { CreateSlideDto } from '../dto/create-slide.dto';
import { UpdateSlideDto } from '../dto/update-slide.dto';

@Controller('slides')
export class SlidesController {
  constructor(private readonly slidesService: SlidesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createSlideDto: CreateSlideDto) {
    return this.slidesService.create(createSlideDto);
  }

  @Get()
  async findAll() {
    return this.slidesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.slidesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() updateSlideDto: UpdateSlideDto) {
    return this.slidesService.update(id, updateSlideDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.slidesService.remove(id);
    return;
  }
}
