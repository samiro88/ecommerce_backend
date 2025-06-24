import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password', // Use App Password (for 2FA accounts)
    },
  });

  async sendEmail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: 'your-email@gmail.com',
      to,
      subject,
      text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent');
    } catch (error) {
      console.error('❌ Failed to send email', error);
    }
  }
}
// src/payments/payme/email.service.ts
// This service uses Nodemailer to send emails. You can customize the transporter configuration based on your email provider.