import { Body, Controller, Post } from '@nestjs/common';
import { SmsService } from '../services/sms.service';
import { WhatsappService } from '../services/whatsapp.service';
import { EmailService } from '../services/email.service';
import { SendSmsDto } from '../modules/dto/send-sms.dto';
import { SendWhatsAppDto } from '../modules/dto/send-whatsapp.dto';
import { SendEmailDto } from '../modules/dto/send-email.dto';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly smsService: SmsService,
    private readonly whatsappService: WhatsappService,
    private readonly emailService: EmailService,
  ) {}

  // ===================
  // 📲 SMS NOTIFICATIONS
  // ===================

  @Post('sms/send')
  async sendSms(@Body() sendSmsDto: SendSmsDto) {
    return this.smsService.sendSms(sendSmsDto.to, sendSmsDto.message);
  }

  // ===================
  // 📞 WHATSAPP NOTIFICATIONS (new)
  // ===================

  @Post('whatsapp/send')
  async sendWhatsApp(@Body() sendWhatsAppDto: SendWhatsAppDto) {
    return this.whatsappService.sendWhatsappMessage(sendWhatsAppDto.to, sendWhatsAppDto.message);
  }

  // ===================
  // 📧 EMAIL NOTIFICATIONS
  // ===================

  @Post('whatsapp')
  async sendOriginalWhatsApp(@Body() sendWhatsAppDto: SendWhatsAppDto) {
    return this.whatsappService.sendWhatsappMessage(sendWhatsAppDto.to, sendWhatsAppDto.message);
  }

  @Post('email/order-confirmation')
  async sendOrderConfirmation(@Body() sendEmailDto: SendEmailDto) {
    const context = {
      subject: sendEmailDto.subject,
      html: sendEmailDto.html,
    };

    return this.emailService.sendOrderConfirmation(
      sendEmailDto.to,
      context,
      sendEmailDto.attachments,
    );
  }

  @Post('email/weekly-promotion')
  async sendWeeklyPromotion(@Body() sendEmailDto: SendEmailDto) {
    const context = {
      subject: sendEmailDto.subject,
      html: sendEmailDto.html,
    };

    return this.emailService.sendWeeklyPromotion(
      sendEmailDto.to,
      context,
      sendEmailDto.attachments,
    );
  }
}
