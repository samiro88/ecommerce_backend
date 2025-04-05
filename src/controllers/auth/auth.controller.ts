// src/auth/auth.controller.ts
import { Controller, Post, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/verify')
  async verifyAdminUser(@Body('id') id: string, @Res() res) {
    try {
      const result = await this.authService.verifyAdminUser(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Post('admin/login')
  async adminLogin(@Body() body: { username: string; password: string }, @Res() res) {
    try {
      const result = await this.authService.adminLogin(body.username, body.password);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Post('admin/logout')
  async adminLogout(@Body('id') id: string, @Res() res) {
    try {
      const result = await this.authService.adminLogout(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Post('client/verify')
  async verifyClient(@Body('id') id: string, @Res() res) {
    try {
      const result = await this.authService.verifyClient(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Post('client/login')
  async clientLogin(@Body() body: { email: string; password: string }, @Res() res) {
    try {
      const result = await this.authService.clientLogin(body.email, body.password);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Post('client/register')
  async clientRegister(@Body() body: any, @Res() res) {
    try {
      const result = await this.authService.clientRegister(
        body.name,
        body.email,
        body.password,
        body.phone1,
        body.ville,
        body.address
      );
      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Post('client/logout')
  async clientLogout(@Body('id') id: string, @Res() res) {
    try {
      const result = await this.authService.clientLogout(id);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}
