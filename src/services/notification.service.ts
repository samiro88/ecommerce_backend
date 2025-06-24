// src/services/notification.service.ts
import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { WhatsappService } from './whatsapp.service';
import { SmsService } from './sms.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsappService,
    private readonly smsService: SmsService,
  ) {}

  async sendOrderNotifications(
    toEmail: string,
    toPhone: string,
    whatsappNumber: string,
    customerName: string,
    orderNumber: string,
  ): Promise<void> {
    // Send Email
    await this.emailService.sendOrderConfirmation(toEmail, {
      customerName,
      orderNumber,
    });

    // Send WhatsApp
    const whatsappMessage = `👋 Hello ${customerName}! Thank you for your order #${orderNumber}. We'll notify you once it's shipped. 🚚`;
    await this.whatsappService.sendWhatsappMessage(whatsappNumber, whatsappMessage);

    // Send SMS
    const smsMessage = `Protein.tn: Hello ${customerName}, your order #${orderNumber} is confirmed!`;
    await this.smsService.sendSms(toPhone, smsMessage);

    console.log('✅ All notifications sent successfully.');
  }

  async sendWeeklyPromotions(
    toEmail: string,
    toPhone: string,
    whatsappNumber: string,
    customerName: string,
  ): Promise<void> {
    // Send Promotional Email
    await this.emailService.sendWeeklyPromotion(toEmail, {
      customerName,
    });

    // Send Promotional WhatsApp
    const promoWhatsapp = `🔥 Hello ${customerName}! Check our new promotions at Protein.tn! 🏋️‍♂️ Visit now: https://protein.tn`;
    await this.whatsappService.sendWhatsappMessage(whatsappNumber, promoWhatsapp);

    // Send Promotional SMS
    const promoSms = `Protein.tn Promo: New deals for you! 🏋️‍♂️ Visit: https://protein.tn`;
    await this.smsService.sendSms(toPhone, promoSms);

    console.log('✅ Weekly promotions sent successfully.');
  }
}
