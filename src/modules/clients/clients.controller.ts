// clients.controller.ts
import { Controller, Post, Body, Get, Param, Put, Req, Inject } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { SmsService } from '../../services/sms.service'; // adjust path if needed

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    @Inject(SmsService) private readonly smsService: SmsService // inject the SMS service
  ) {}

  @Post('subscribe')
  async subscribe(@Body() body: { email: string }) {
    return this.clientsService.subscribeButton(body.email);
  }

  @Post('guest')
  async createGuest(@Body() body: any) {
    return this.clientsService.createGuestClient(body);
  }

  @Post('convert-guest')
  async convertGuest(@Body() body: { email: string, password: string }) {
    return this.clientsService.convertGuestToClient(body.email, body.password);
  }

  @Post('register')
  async register(@Body() body: { email: string, password: string }) {
    return this.clientsService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string, password: string }) {
    return this.clientsService.login(body.email, body.password);
  }

  @Get('profile')
  async getProfile(@Req() req) {
    return this.clientsService.getProfile(req.user.id); // assuming req.user.id is set by a guard
  }

  @Put('profile')
  async updateProfile(@Req() req, @Body() body: any) {
    return this.clientsService.updateProfile(req.user.id, body);
  }

  @Get()
  async getAllClients() {
    return this.clientsService.getAllClients();
  }

  @Post('sms/send')
  async sendSms(@Body() body: { to: string; message: string }) {
    await this.smsService.sendSms(body.to, body.message);
    return { success: true };
  }

  @Put(':id')
async updateClient(@Param('id') id: string, @Body() body: any) {
  return this.clientsService.updateProfile(id, body);
}


@Post('sms/send-bulk')
async sendBulkSms(@Body() body: { to: string[]; message: string }) {
  for (const phone of body.to) {
    await this.smsService.sendSms(phone, body.message);
  }
  return { success: true, count: body.to.length };
}
  // Other methods...
}
