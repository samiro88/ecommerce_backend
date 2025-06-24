import { Controller, Post, Body, Headers } from '@nestjs/common';
import { PaymeService } from './payme.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments/payme')
export class PaymeController {
  constructor(private readonly paymeService: PaymeService) {}

  @Post('create')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymeService.createPayment(createPaymentDto);
  }

  @Post('verify')
  async verifyPayment(@Body('paymentId') paymentId: string) {
    return this.paymeService.verifyPayment(paymentId);
  }

  @Post('webhook')
  async webhook(@Body() payload: any, @Headers() headers: any) {
    return this.paymeService.handleWebhook(payload, headers);
  }
}