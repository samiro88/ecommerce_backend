import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invoice } from '../models/invoice.schema';
import { Model } from 'mongoose';
import * as ExcelJS from 'exceljs';
import * as puppeteer from 'puppeteer';
import { Buffer } from 'buffer';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<Invoice>,
  ) {}

  // ==================== PDF METHODS ====================
  async exportInvoiceAsPDF(id: string): Promise<Buffer> {
    try {
      const invoice = await this.invoiceModel
        .findById(id)
        .populate('items.product')
        .populate('client')
        .orFail(new Error('Invoice not found'))
        .exec();

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      const page = await browser.newPage();
      await page.setContent(this.generateInvoiceHTML(invoice));
      const pdfBuffer = await page.pdf({ format: 'A4' });
      await browser.close();
      this.validateFileSize(Buffer.from(pdfBuffer), 'PDF');
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`PDF generation failed for invoice ${id}`, error.stack);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  async exportSalesReportAsPDF(
    stats: { totalRevenue: number; totalSold: number },
    dateRange: { start: Date; end: Date }
  ): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      
      await page.setContent(this.generateSalesReportHTML(stats, dateRange));
      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();
  
      const pdfBuffer = pdf; // Define pdfBuffer here
      this.validateFileSize(Buffer.from(pdfBuffer), 'PDF');
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Sales report PDF generation failed', error.stack);
      throw new Error(`Sales report PDF failed: ${error.message}`);
    }
  }

  private generateSalesReportHTML(
    stats: { totalRevenue: number; totalSold: number },
    dateRange: { start: Date; end: Date }
  ): string {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 30px; }
            h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .stats { margin: 20px 0; }
            .stat-row { display: flex; margin: 10px 0; }
            .stat-label { font-weight: bold; width: 200px; }
            .footer { margin-top: 30px; color: #7f8c8d; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <h1>Sales Report (${dateRange.start.toDateString()} - ${dateRange.end.toDateString()})</h1>
          <div class="stats">
            <div class="stat-row">
              <span class="stat-label">Total Revenue:</span>
              <span>${stats.totalRevenue.toFixed(2)} DT</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Total Items Sold:</span>
              <span>${stats.totalSold}</span>
            </div>
          </div>
          <div class="footer">
            Generated on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;
  }

  // ==================== EXCEL METHODS ====================
  async exportInvoicesAsExcel(from: string, to: string): Promise<Buffer> {
    try {
      const invoices = await this.invoiceModel
        .find({
          date: {
            $gte: new Date(from),
            $lte: new Date(to),
          },
        })
        .populate('client')
        .populate('items.product')
        .exec();

      if (invoices.length === 0) {
        throw new Error('No invoices found for the selected period');
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Invoices');

      // Header with styling
      sheet.columns = [
        { header: 'Invoice ID', key: 'id', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Client', key: 'client', width: 25 },
        { header: 'Product', key: 'product', width: 30 },
        { header: 'Qty', key: 'quantity', width: 8 },
        { header: 'Unit Price', key: 'price', width: 12, style: { numFmt: '0.00' } },
        { header: 'Tax %', key: 'taxRate', width: 8 },
        { header: 'Line Total', key: 'lineTotal', width: 12, style: { numFmt: '0.00' } },
        { header: 'Invoice Total', key: 'invoiceTotal', width: 15, style: { numFmt: '0.00' } },
      ];

      // Data rows
      invoices.forEach(invoice => {
        const invoiceData = invoice.toObject();
        invoiceData.items.forEach((item: any) => {
          sheet.addRow({
            id: invoiceData.invoiceNumber,
            date: invoiceData.date.toISOString().split('T')[0],
            client: invoiceData.clientType || 'N/A',
            product: item.product?.designation || 'N/A',
            quantity: item.quantity,
            price: item.price,
            taxRate: item.taxRate,
            lineTotal: item.price * item.quantity,
            invoiceTotal: invoiceData.total
          });
        });
      });

      // Totals row with formatting
      const totalAmount = invoices.reduce((sum, inv) => sum + (inv.get('total') || 0), 0);
      const totalRow = sheet.addRow({
        id: 'TOTAL',
        invoiceTotal: totalAmount
      });
      totalRow.font = { bold: true };
      totalRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }
        };
      });

      const buffer = (await workbook.xlsx.writeBuffer()) as Buffer;
      this.validateFileSize(buffer, 'Excel');
      return buffer;
    } catch (error) {
      this.logger.error(`Excel export failed for period ${from} to ${to}`, error.stack);
      throw new Error(`Excel export failed: ${error.message}`);
    }
  }

  // ==================== UTILITY METHODS ====================
  private validateFileSize(buffer: Buffer, type: string): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.byteLength > maxSize) {
      this.logger.warn(`Large ${type} file detected: ${(buffer.byteLength / (1024 * 1024)).toFixed(2)}MB`);
      // Consider alternative delivery for large files (e.g., cloud storage link)
    }
  }

  private generateInvoiceHTML(invoice: any): string {
    const invoiceData = invoice.toObject ? invoice.toObject() : invoice;
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; border: 1px solid #ccc; text-align: left; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <h1>Invoice #${invoiceData.invoiceNumber || invoiceData._id}</h1>
          <p>Date: ${new Date(invoiceData.date).toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Tax</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map((item: any) => `
                <tr>
                  <td>${item.product?.designation || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price?.toFixed(2) || '0.00'}</td>
                  <td>${item.taxRate || 0}%</td>
                  <td class="text-right">${((item.price * item.quantity) * (1 + (item.taxRate || 0)/100)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 30px; float: right; width: 300px;">
            <p><strong>Subtotal:</strong> ${invoiceData.subtotal?.toFixed(2) || '0.00'} DT</p>
            <p><strong>Tax:</strong> ${invoiceData.tax?.toFixed(2) || '0.00'} DT</p>
            <p><strong>Total:</strong> ${invoiceData.total?.toFixed(2) || '0.00'} DT</p>
          </div>
        </body>
      </html>
    `;
  }
}