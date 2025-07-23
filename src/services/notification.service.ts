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
    address: string,
    city: string,
    postalCode: string,
    phone: string,
    billing_localite?: string,
    gouvernorat?: string,
    cart: any[] = [],
    subtotal?: string,
    shippingCost?: string,
    shippingMethod?: string,
    total?: string,
  ): Promise<void> {
    // Debug: Log the payload
    console.log('[Order Notification] Payload:', {
      toEmail,
      toPhone,
      customerName,
      orderNumber,
    });

    // Fix: compute subtotal and total
    let computedSubtotal = 0;

    const orderItems = cart.map(item => {
      const itemTotal = item.price * item.quantity;
      computedSubtotal += itemTotal;

      return {
        name: item.title || item.name || item.product_name,
        quantity: item.quantity,
        price: `${itemTotal}`,
      };
    });

    const computedShipping = parseFloat(shippingCost || '0');
    const computedTotal = computedSubtotal + computedShipping;

    // Send Email
    try {
      await this.emailService.sendOrderConfirmation(toEmail, {
        customerName,
        orderNumber,
        customerEmail: toEmail,
        address,
        city,
        postalCode,
        phone,
        billing_localite,
        gouvernorat,
        orderItems,
        subtotal: computedSubtotal.toFixed(3),
        shippingCost: computedShipping.toFixed(3),
        shippingMethod,
        total: computedTotal.toFixed(3),
      });
      console.log(`[Order Notification] ✅ Email sent to: ${toEmail}`);
    } catch (err) {
      console.error(`[Order Notification] ❌ Failed to send email to: ${toEmail}`, err);
    }

    // Send SMS
    const smsMessage = `Bonjour ${customerName},

Pour information – nous avons reçu votre commande n°${orderNumber}, elle est maintenant en cours de traitement :

Payez en argent comptant à la livraison.`;
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
    // Send Promotional Email only
    await this.emailService.sendWeeklyPromotion(toEmail, {
      customerName,
    });
    console.log('✅ Weekly promotions email sent successfully.');
  }
}
