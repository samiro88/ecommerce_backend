import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as QRCode from 'qrcode';

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

    // Generate QR code buffer (based on order number or your logic)
    const qrCodeBuffer = await QRCode.toBuffer(`https://protein.tn/track-order/${context.orderNumber || 'default'}`);

    // Add QR code to attachments as inline image (cid)
    const qrAttachment = {
      filename: 'qr-code.png',
      content: qrCodeBuffer,
      cid: 'qr-code-cid', // Use this in your HBS: <img src="cid:qr-code-cid" />
    };

    await this.transporter.sendMail({
      from: `"Protein Tunisia" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Order Confirmation - Protein Tunisia',
      html: htmlContent,
      attachments: [...attachments, qrAttachment],
    });
  }

 async sendWeeklyPromotion(to: string, context: any, attachments: any[] = []): Promise<void> {
    const htmlContent = this.compileTemplate('weekly-promotion', context);
    const fs = require('fs');
    // Generate QR code (matches template's cid:qr-code-cid)
    const qrCodeBuffer = await QRCode.toBuffer(context.promotionsLink || 'https://protein.tn');
    const qrAttachment = {
      filename: 'qr-code.png',
      content: qrCodeBuffer,
      cid: 'qr-code-cid' // Exactly matches your template
    };
    // Attach logo as inline image (cid:logo-cid)
    let logoAttachment: { filename: string; path: string; cid: string } | null = null;
    try {
      const logoPath = 'c:/Users/LENOVO/Desktop/ecommerce/template_front/public/images/logo/logo.png';
      if (fs.existsSync(logoPath)) {
        logoAttachment = {
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo-cid',
        };
      }
    } catch (e) {
      console.error('Logo attachment error:', e);
    }
    const allAttachments = logoAttachment
      ? [...attachments, qrAttachment, logoAttachment]
      : [...attachments, qrAttachment];
    await this.transporter.sendMail({
      from: `"Protein Tunisia" <${process.env.EMAIL_USER}>`,
      to,
      subject: context.subject || 'This Week’s Offers - Protein Tunisia',
      html: htmlContent,
      attachments: allAttachments, // Preserves existing attachments and adds logo
    });
  }

  async sendOrderShipped(to: string, context: any, attachments: any[] = []): Promise<void> {
    console.log('Shipped Context:', context); // Logging for verification
    try {
      // Calculate subtotal, shippingCost, and total
      const subtotal = context.orderItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
      const shippingCost = 10;
      const total = subtotal + shippingCost;
      // Override context values
      const updatedContext = {
        ...context,
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        total: total.toString(),
      };
      // Generate QR code (same as order confirmation)
      const qrCodeBuffer = await QRCode.toBuffer(`https://protein.tn/track-order/${context.orderNumber || 'default'}`);
      const qrAttachment = {
        filename: 'qr-code.png',
        content: qrCodeBuffer,
        cid: 'qr-code-cid' // Matches template's <img src="cid:qr-code-cid">
      };
      // Attach logo as inline image (cid:logo-cid)
      let logoAttachment: { filename: string; path: string; cid: string } | null = null;
      try {
        const logoPath = 'c:/Users/LENOVO/Desktop/ecommerce/template_front/public/images/logo/logo.png';
        if (fs.existsSync(logoPath)) {
          logoAttachment = {
            filename: 'logo.png',
            path: logoPath,
            cid: 'logo-cid',
          };
        }
      } catch (e) {
        console.error('Logo attachment error:', e);
      }
      const allAttachments = logoAttachment
        ? [...attachments, qrAttachment, logoAttachment]
        : [...attachments, qrAttachment];
      const htmlContent = this.compileTemplate('order-shipped', updatedContext);

      const info = await this.transporter.sendMail({
        from: `"Protein Tunisia" <${process.env.EMAIL_USER}>`,
        to,
        subject: context.subject || 'Votre commande a été expédiée - Protein Tunisia', // Uses French subject from request or falls back
        html: htmlContent,
        attachments: allAttachments, // Merge existing attachments + QR code + logo
      });
      console.log('Email sent:', info);
    } catch (error) {
      console.error('Error sending shipped email:', error);
      throw error;
    }
  }
}
