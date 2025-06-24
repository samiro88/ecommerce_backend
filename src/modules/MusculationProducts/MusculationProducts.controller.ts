// C:\Users\LENOVO\Desktop\ecommerce\ecommerce-backend\src\modules\MusculationProducts\MusculationProducts.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MusculationProductService } from './MusculationProducts.service';
import { CreateMusculationProductDto } from '../dto/create-musculation-product.dto';
import { UpdateMusculationProductDto } from '../dto/update-musculation-product.dto';
import { MusculationProduct } from '../../models/MusculationProducts.schema';

@Controller('musculation-products')
export class MusculationProductController {
  constructor(private readonly musculationProductService: MusculationProductService) {}

  @Get()
  async findAll(): Promise<MusculationProduct[]> {
    return this.musculationProductService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MusculationProduct> {
    return this.musculationProductService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateMusculationProductDto): Promise<MusculationProduct> {
    return this.musculationProductService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMusculationProductDto,
  ): Promise<MusculationProduct> {
    return this.musculationProductService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.musculationProductService.remove(id);
  }
  @Get('slug/:slug')
async findBySlug(@Param('slug') slug: string): Promise<MusculationProduct> {
  return this.musculationProductService.findBySlug(slug);
}

}

