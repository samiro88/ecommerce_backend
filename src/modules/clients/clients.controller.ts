// clients.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Req, Inject } from '@nestjs/common';
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

  @Post('sms/send')
  async sendSms(@Body() body: { to: string; message: string }) {
    await this.smsService.sendSms(body.to, body.message);
    return { success: true };
  }

  @Post('sms/send-bulk')
  async sendBulkSms(@Body() body: { to: string[]; message: string }) {
    for (const phone of body.to) {
      await this.smsService.sendSms(phone, body.message);
    }
    return { success: true, count: body.to.length };
  }

  @Post('admin/new-with-data')
  async adminCreateClient(@Body() clientData: any) {
    try {
      console.log('=== CLIENT ADMIN CREATE ENDPOINT HIT ===');
      console.log('Body received:', clientData);
      
      // Clean the data - remove empty strings and set defaults
      const cleanData = { ...clientData };
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '' || cleanData[key] === null || cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });
      
      // Set required defaults to avoid validation errors
      const clientPayload = {
        ...cleanData,
        isGuest: true,
        sms: cleanData.sms || "0",
        subscriber: cleanData.subscriber || false,
        // Only set email if provided and not empty
        ...(cleanData.email && cleanData.email.trim() !== '' && { email: cleanData.email }),
      };
      
      // Create client using direct service method
      const result = await this.clientsService.createClientDirect(clientPayload);
      const savedClient = result.data;
      
      console.log('Client created successfully');
      
      return {
        success: true,
        message: 'Client created successfully',
        data: savedClient
      };
    } catch (error) {
      console.error('Client creation error:', error);
      throw error;
    }
  }

  @Post()
  async createClient(@Body() body: any) {
    return this.clientsService.createGuestClient(body);
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

  @Put(':id')
  async updateClient(@Param('id') id: string, @Body() body: any) {
    return this.clientsService.updateProfile(id, body);
  }

  @Delete(':id')
  async deleteClient(@Param('id') id: string) {
    return this.clientsService.deleteClient(id);
  }

  // Other methods...
}
