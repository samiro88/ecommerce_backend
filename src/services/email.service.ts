import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';

dotenv.config();

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

private compileTemplate(templateName: string, context: any): string {
  // Determine base directory depending on dev or prod
  const baseDir =
    process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), 'dist', 'templates')
      : path.join(process.cwd(), 'src', 'templates');
  const templatePath = path.join(baseDir, `${templateName}.hbs`);
  console.log('Looking for template at:', templatePath);
  const source = fs.readFileSync(templatePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  return template(context);
}

  async sendOrderConfirmation(to: string, context: any, attachments: any[] = []): Promise<void> {
    const htmlContent = this.compileTemplate('order-confirmation', context);
    await this.transporter.sendMail({
      from: `"Protein Tunisia" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Order Confirmation - Protein Tunisia',
      html: htmlContent,
      attachments,
    });
  }

  async sendWeeklyPromotion(to: string, context: any, attachments: any[] = []): Promise<void> {
    const htmlContent = this.compileTemplate('weekly-promotion', context);
    await this.transporter.sendMail({
      from: `"Protein Tunisia" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'This Week’s Offers - Protein Tunisia',
      html: htmlContent,
      attachments,
    });
  }

  async sendOrderShipped(to: string, context: any, attachments: any[] = []): Promise<void> {
    const htmlContent = this.compileTemplate('order-shipped', context);
    await this.transporter.sendMail({
      from: `"Protein Tunisia" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your Order Has Shipped - Protein Tunisia',
      html: htmlContent,
      attachments,
    });
  }
}
