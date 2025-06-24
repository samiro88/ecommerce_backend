import { Controller, Get, Param, Query, Res, Header } from '@nestjs/common';
import { ExportService } from './export.service';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Export')
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('invoices/pdf/:id')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=invoice.pdf')
  @ApiOperation({ summary: 'Export invoice as PDF' })
  @ApiResponse({ status: 200, description: 'PDF file' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async getInvoicePDF(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.exportService.exportInvoiceAsPDF(id);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(404).json({
        statusCode: 404,
        message: error.message,
      });
    }
  }

  @Get('invoices/excel')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=invoices.xlsx')
  @ApiOperation({ summary: 'Export invoices as Excel' })
  @ApiResponse({ status: 200, description: 'Excel file' })
  async getInvoicesExcel(
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    try {
      if (!from || !to) {
        throw new Error('Both from and to dates are required');
      }
      
      const excelBuffer = await this.exportService.exportInvoicesAsExcel(from, to);
      res.send(excelBuffer);
    } catch (error) {
      res.status(400).json({
        statusCode: 400,
        message: error.message,
      });
    }
  }
}