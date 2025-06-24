import { Body, Controller, Get, Param, Patch, Post, Delete, Query } from '@nestjs/common';
import { InvoiceService } from '../services/invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() body: any) {
    return this.invoiceService.createInvoice(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() update: any) {
    return this.invoiceService.updateInvoice(id, update);
  }

  @Patch(':id/date')
  updateDate(@Param('id') id: string, @Body('date') date: string) {
    return this.invoiceService.updateInvoiceDate(id, date);
  }

  @Get(':id')
  getInvoice(@Param('id') id: string) {
    return this.invoiceService.getInvoice(id);
  }

  @Get()
  getAllInvoices(@Query() query: any) {
    // Support filtering by client, commande, date, etc.
    return this.invoiceService.getAllInvoices(query);
  }

  @Delete(':id')
  deleteInvoice(@Param('id') id: string) {
    return this.invoiceService.deleteInvoice(id);
  }
}