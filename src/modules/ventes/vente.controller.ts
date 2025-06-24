import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseArrayPipe,
  } from '@nestjs/common';
  import { VentesService } from './vente.service';
  import { CreateVenteDto } from './dto/create-vente.dto';
  import { UpdateVenteDto } from './dto/update-vente.dto';
  import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';
  import { CommandeVenteDto } from './dto/commande-vente.dto';
  
  @Controller('ventes')
  export class VentesController {
    constructor(private readonly ventesService: VentesService) {}
  
    @Post()
    async create(@Body() createVenteDto: CreateVenteDto) {
      return this.ventesService.create(createVenteDto);
    }
  
    @Post('commande')
    async createCommande(@Body() commandeVenteDto: CommandeVenteDto) {
      return this.ventesService.createCommande(commandeVenteDto);
    }
  
    @Get()
    async findAll() {
      return this.ventesService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.ventesService.findOne(id);
    }
  
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateVenteDto: UpdateVenteDto) {
      return this.ventesService.update(id, updateVenteDto);
    }
  
    @Put(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
      return this.ventesService.updateStatus(id, status);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string) {
      return this.ventesService.remove(id);
    }
  
    @Delete()
    async removeMany(@Body('ids', ParseArrayPipe) ids: string[]) {
      return this.ventesService.removeMany(ids);
    }
  
    @Get('promo-code/validate')
    async validatePromoCode(@Query() validatePromoCodeDto: ValidatePromoCodeDto) {
      return this.ventesService.validatePromoCode(validatePromoCodeDto.code);
    }
  }