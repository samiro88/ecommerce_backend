import {
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
    UsePipes,
    Body,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { AdminGuard, ClientGuard } from './guards/auth.guard';
  import { ValidationPipe } from '../pipes/validation.pipe';
  import {
    AdminLoginDto,
    ClientLoginDto,
    ClientRegisterDto,
  } from './dto/auth.dto';
  
  @Controller()
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    // Admin auth routes
    @Get('admin/check-auth-status/:token')
    @UseGuards(AdminGuard)
    async verifyAdminUser(@Param('token') token: string) {
      return this.authService.verifyAdminUser(token);
    }
  
    @Post('admin/login')
    @UsePipes(new ValidationPipe(AdminLoginDto))
    async adminLogin(@Body() loginData: AdminLoginDto) {
      return this.authService.adminLogin(loginData);
    }
  
    @Get('admin/logout/:token')
    @UseGuards(AdminGuard)
    async adminLogout(@Param('token') token: string) {
      return this.authService.adminLogout(token);
    }
  
    // Store (Client) auth routes
    @Get('store/check-auth-status/:token')
    @UseGuards(ClientGuard)
    async verifyClient(@Param('token') token: string) {
      return this.authService.verifyClient(token);
    }
  
    @Get('store/logout/:token')
    @UseGuards(ClientGuard)
    async clientLogout(@Param('token') token: string) {
      return this.authService.clientLogout(token);
    }
  
    @Post('store/login')
    @UsePipes(new ValidationPipe(ClientLoginDto))
    async clientLogin(@Body() loginData: ClientLoginDto) {
      return this.authService.clientLogin(loginData);
    }
  
    @Post('store/register')
    async clientRegister(@Body() registerData: ClientRegisterDto) {
      return this.authService.clientRegister(registerData);
    }
  }