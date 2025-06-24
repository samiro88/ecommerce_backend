import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExportService } from '../export/export.service';
import { AnalyticsService } from '../services/analytics.service'; // ✅ Injected
import * as nodemailer from 'nodemailer';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly exportService: ExportService,
    private readonly analyticsService: AnalyticsService, // ✅ Added
  ) {
    // Singleton transporter with environment variables
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async handleDailyReport() {
    const reportName = 'Daily Sales Report';
    
    try {
      this.logger.log(`🔄 Starting ${reportName} generation...`);

      // Calculate date range (last 7 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      // ✅ Fetch real KPI data
      const statsArray = await this.analyticsService.filterSales({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      });
      const stats = statsArray[0] || { totalRevenue: 0, totalSold: 0 };

      // ✅ Generate Excel report
      const excelBuffer = await this.exportService.exportInvoicesAsExcel(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
      );

      // ✅ Send email with KPIs + attachment
      await this.transporter.sendMail({
        from: `E-Commerce System <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `${reportName} (${this.formatDate(startDate)} - ${this.formatDate(endDate)})`,
        html: this.generateEmailHtml(startDate, endDate, stats),
        attachments: [{
          filename: `${reportName.toLowerCase().replace(/ /g, '_')}_${endDate.getTime()}.xlsx`,
          content: excelBuffer,
        }],
      });

      this.logger.log(`✅ ${reportName} sent successfully!`);
    } catch (error) {
      this.logger.error(`❌ ${reportName} failed: ${error.message}`);
      // Optional: alert admin or log to external service (Sentry, etc.)
    }
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  private generateEmailHtml(startDate: Date, endDate: Date, stats: any): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2c3e50;">📊 Weekly Sales Report</h2>
        <p><strong>Period:</strong> ${this.formatDate(startDate)} – ${this.formatDate(endDate)}</p>
        <ul>
          <li><strong>Total Revenue:</strong> ${stats.totalRevenue?.toFixed(2) || 0} DT</li>
          <li><strong>Total Items Sold:</strong> ${stats.totalSold || 0}</li>
        </ul>
        <p>Please find attached the weekly sales report in Excel format.</p>
        <hr style="border: 0; border-top: 1px solid #eee;"/>
        <p style="font-size: 0.9em; color: #7f8c8d;">
          Generated on ${new Date().toLocaleString()}
        </p>
      </div>
    `;
  }
}
