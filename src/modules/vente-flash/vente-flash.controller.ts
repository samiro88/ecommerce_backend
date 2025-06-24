import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { VenteFlashService } from './vente-flash.service';
import { CreateVenteFlashDto } from './dto/create-vente-flash.dto';
import { UpdateVenteFlashDto } from './dto/update-vente-flash.dto';

@Controller('vente-flash')
export class VenteFlashController {
  constructor(private readonly venteFlashService: VenteFlashService) {}

  @Post()
  create(@Body() createVenteFlashDto: CreateVenteFlashDto) {
    return this.venteFlashService.create(createVenteFlashDto);
  }

  @Get()
  findAll() {
    return this.venteFlashService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.venteFlashService.findOne(id);
  }

  @Get(':id/products')
  getProducts(@Param('id') id: string) {
    return this.venteFlashService.getFlashSaleProducts(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateVenteFlashDto: UpdateVenteFlashDto) {
    return this.venteFlashService.update(id, updateVenteFlashDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.venteFlashService.delete(id);
  }
}