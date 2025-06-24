// src/modules/commande/commande.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CommandeService } from './commande.service';

@Controller('commande')
export class CommandeController {
  constructor(private readonly commandeService: CommandeService) {}

  @Post()
  async create(@Body() data: any) {
    return this.commandeService.create(data);
  }

  @Get()
  async findAll() {
    return this.commandeService.findAll();
  }

  // --- Add this block ---
  @Get('numero/:numero')
  async findByNumero(@Param('numero') numero: string) {
    return this.commandeService.findByNumero(numero);
  }
  // ----------------------

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.commandeService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.commandeService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.commandeService.remove(id);
  }

  // Analytics endpoints
  @Get('analytics/orders-by-status')
  async getOrdersByStatus() {
    return this.commandeService.getOrdersByStatus();
  }

  @Get('analytics/orders-by-country')
  async getOrdersByCountry() {
    return this.commandeService.getOrdersByCountry();
  }
}