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
async sendWeeklyPromotion(@Body() body: { to: string; customerName: string; customerEmail: string; unsubscribeLink: string }) {
console.log('--- TOP OF sendWeeklyPromotion ---');
console.log('[sendWeeklyPromotion] Received body:', body);
await this.emailService.sendWeeklyPromotion(body.to, {
customerName: body.customerName,
customerEmail: body.customerEmail,
unsubscribeLink: body.unsubscribeLink,
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

@Post('preview')
async previewTemplate(@Body() body: { type: string; payload: any }) {
  let html = this.emailService.compileTemplate(body.type, body.payload);

  // Replace cid:logo-cid with your public logo URL (always works in browser)
  html = html.replace(
    /src="cid:logo-cid"/g,
    'src="https://protein.tn/images/logo/logo.png"'
  );

  // Replace cid:qr-code-cid with a public QR code generator (fallback for preview)
  // If you want to use the order number in the QR code, use the payload if present:
  const qrData = body.payload?.orderNumber
    ? `https://protein.tn/track-order/${body.payload.orderNumber}`
    : 'https://protein.tn';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}`;

  html = html.replace(
    /src="cid:qr-code-cid"/g,
    `src="${qrUrl}"`
  );

  return { html };
}


@Post('create-template')
async createTemplate(@Body() body: { type: string; html: string }) {
  this.emailService.createTemplate(body.type, body.html);
  return { message: 'Template créé avec succès !' };
}
}
