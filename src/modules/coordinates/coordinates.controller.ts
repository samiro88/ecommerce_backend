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
import { CoordinatesService } from './coordinates.service';
import { CreateCoordinatesDto } from '../dto/create-coordinates.dto';
import { UpdateCoordinatesDto } from '../dto/update-coordinates.dto';

@Controller('coordinates')
export class CoordinatesController {
  constructor(private readonly coordinatesService: CoordinatesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createCoordinatesDto: CreateCoordinatesDto) {
    return this.coordinatesService.create(createCoordinatesDto);
  }

  @Get()
  async findAll() {
    return this.coordinatesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coordinatesService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() updateCoordinatesDto: UpdateCoordinatesDto) {
    return this.coordinatesService.update(id, updateCoordinatesDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.coordinatesService.remove(id);
    return;
  }
}
