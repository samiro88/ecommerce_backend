import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from '../services/email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-order-confirmation')
  async sendOrderConfirmation(@Body() body: { to: string; customerName: string; orderNumber: string }) {
    await this.emailService.sendOrderConfirmation(body.to, {
      customerName: body.customerName,
      orderNumber: body.orderNumber,
    });
    return { message: '✅ Order confirmation email sent successfully!' };
  }

@Post('send-weekly-promotion')
async sendWeeklyPromotion(@Body() body: { to: string; customerName: string }) {
  console.log('--- TOP OF sendWeeklyPromotion ---');
  console.log('[sendWeeklyPromotion] Received body:', body);
  await this.emailService.sendWeeklyPromotion(body.to, {
    customerName: body.customerName,
  });
  return { message: '✅ Weekly promotion email sent successfully!' };
}

  @Post('send-order-shipped')
  async sendOrderShipped(@Body() body: { to: string; customerName: string; orderNumber: string }) {
    await this.emailService.sendOrderShipped(body.to, {
      customerName: body.customerName,
      orderNumber: body.orderNumber,
    });
    return { message: '✅ Order shipped email sent successfully!' };
  }
}
