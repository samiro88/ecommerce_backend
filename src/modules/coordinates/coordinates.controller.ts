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
import { CoordinatesService } from './coordinates.service';
import { CreateCoordinatesDto } from '../dto/create-coordinates.dto';
import { UpdateCoordinatesDto } from '../dto/update-coordinates.dto';

@Controller('coordinates')
export class CoordinatesController {
  constructor(private readonly coordinatesService: CoordinatesService) {
    console.log('CoordinatesController initialized');
  }

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
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'logo_facture', maxCount: 1 },
    { name: 'logo_footer', maxCount: 1 },
  ]))
  async update(
    @Param('id') id: string, 
    @Body() updateCoordinatesDto: any,
    @UploadedFiles() files?: { logo?: Express.Multer.File[], logo_facture?: Express.Multer.File[], logo_footer?: Express.Multer.File[] }
  ) {
    console.log('PATCH /coordinates/:id called with id:', id);
    console.log('Update data:', updateCoordinatesDto);
    console.log('Files:', files);
    return this.coordinatesService.updateWithFiles(id, updateCoordinatesDto, files);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.coordinatesService.remove(id);
    return;
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'logo_facture', maxCount: 1 },
    { name: 'logo_footer', maxCount: 1 },
  ]))
  async updateWithPut(
    @Param('id') id: string, 
    @Body() updateCoordinatesDto: any,
    @UploadedFiles() files?: { logo?: Express.Multer.File[], logo_facture?: Express.Multer.File[], logo_footer?: Express.Multer.File[] }
  ) {
    console.log('PUT /coordinates/:id called with id:', id);
    console.log('Update data:', updateCoordinatesDto);
    console.log('Files:', files);
    return this.coordinatesService.updateWithFiles(id, updateCoordinatesDto, files);
  }
}
