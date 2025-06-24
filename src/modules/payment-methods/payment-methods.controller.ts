import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  async findAll() {
    return this.paymentMethodsService.findAll();
  }

  // Admin endpoints (optional: protect with guards)
  @Get('admin')
  async findAllAdmin() {
    return this.paymentMethodsService.findAllAdmin();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.paymentMethodsService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.paymentMethodsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.paymentMethodsService.delete(id);
  }
}