// src/services/notification.service.ts
import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async sendOrderNotifications(
    toEmail: string,
    toPhone: string,
    customerName: string,
    orderNumber: string,
  ): Promise<void> {
    // Debug: Log the payload
    console.log('[Order Notification] Payload:', {
      toEmail,
      toPhone,
      customerName,
      orderNumber,
    });

    // Send Email
    try {
      await this.emailService.sendOrderConfirmation(toEmail, {
        customerName,
        orderNumber,
      });
      console.log(`[Order Notification] ✅ Email sent to: ${toEmail}`);
    } catch (err) {
      console.error(`[Order Notification] ❌ Failed to send email to: ${toEmail}`, err);
    }

    // Send SMS
    const smsMessage = `Protein.tn: Hello ${customerName}, your order #${orderNumber} is confirmed!`;
    try {
      await this.smsService.sendSms(toPhone, smsMessage);
      console.log(`[Order Notification] ✅ SMS sent to: ${toPhone}`);
    } catch (err) {
      console.error(`[Order Notification] ❌ Failed to send SMS to: ${toPhone}`, err);
    }

    console.log('[Order Notification] Notification process completed.');
  }

  async sendWeeklyPromotions(
    toEmail: string,
    toPhone: string,
    customerName: string,
  ): Promise<void> {
    // Send Promotional Email
    await this.emailService.sendWeeklyPromotion(toEmail, {
      customerName,
    });

    // Send Promotional SMS
    const promoSms = `Protein.tn Promo: New deals for you! 🏋️‍♂️ Visit: https://protein.tn`;
    await this.smsService.sendSms(toPhone, promoSms);

    console.log('✅ Weekly promotions sent successfully.');
  }
}