// clients.controller.ts
import { Controller, Post, Body, Get, Param, Put, Req } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

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

  // Other methods...
}
