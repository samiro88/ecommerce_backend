import { Controller, Get, Post, Param, UseGuards, UsePipes, Body, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminGuard, ClientGuard } from './guards/auth.guard';
import { ValidationPipe } from '../pipes/validation.pipe';
import { AdminLoginDto, AdminRegisterDto ,ClientLoginDto, ClientRegisterDto } from './dto/auth.dto';
import { ClientLoginResponse } from '../../shared/utils/tokens/interfaces/auth-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';
import { Model } from 'mongoose';
import { Client } from '../../models/client.schema';
import { compare } from 'bcryptjs';
import { TokenService } from '../../shared/utils/tokens/token.service';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    private readonly tokenService: TokenService,
  ) {}


  // Admin auth routes
  @Get('admin/check-auth-status/:token')
  @UseGuards(AdminGuard)
  async verifyAdminUser(@Param('token') token: string) {
      return this.authService.verifyAdminUser(token);
  }

  @Post('admin/login')
  @UsePipes(new ValidationPipe(AdminLoginDto))
  async adminLogin(@Body() loginData: AdminLoginDto) {
      return this.authService.adminLogin(loginData.identifier, loginData.password);
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
  async clientLogin(@Body() loginData: ClientLoginDto): Promise<ClientLoginResponse> {
    try {
      const { email, password } = loginData;
      this.logger.log(`Login attempt for email: ${email}`);
      let client = await this.clientModel.findOne({ email });
  
      if (!client) {
        throw new HttpException(
          { status: 'error', code: 'USER_NOT_FOUND', message: 'User not registered' },
          HttpStatus.BAD_REQUEST
        );
      }
  
      // If the client is a guest, prompt to convert to a regular client
      if (client.isGuest) {
        // Option 1: Automatically convert the guest to a regular client (you could ask for a password during login)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        client.password = hashedPassword;
        client.isGuest = false;
        await client.save();
  
        const token = this.tokenService.createToken((client._id as ObjectId).toString(), 'client', '30d');
        const clientObj = client.toObject();
        delete (clientObj as any).password;
  
        return {
          status: 'ok',
          message: 'Guest account converted to regular client successfully',
          user: {
            id: (clientObj._id as string | ObjectId).toString(),
            email: clientObj.email,
            name: clientObj.name,
            phone1: clientObj.phone1,
            ville: clientObj.ville,
            address: clientObj.address,
          },
          token,
        };
      }
  
      // Normal password validation for non-guest clients
      const isPasswordCorrect = await compare(password, client.password);
      if (!isPasswordCorrect) {
        throw new HttpException(
          { status: 'error', code: 'INCORRECT_PASSWORD', message: 'Incorrect Password' },
          HttpStatus.BAD_REQUEST
        );
      }
  
      const token = this.tokenService.createToken((client._id as ObjectId).toString(), 'client', '30d');
      const clientObj = client.toObject();
      delete (clientObj as any).password;
  
      return {
        status: 'ok',
        message: 'Login successful',
        user: {
          id: (clientObj._id as string | ObjectId).toString(),
          email: clientObj.email,
          name: clientObj.name,
          phone1: clientObj.phone1,
          ville: clientObj.ville,
          address: clientObj.address,
        },
        token,
      };
    } catch (error) {
      this.logger.error(`Error during client login: ${error.message}`);
  
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { status: 'error', code: 'SERVER_ERROR', message: 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }  


  @Post('store/register')
  @UsePipes(new ValidationPipe(ClientRegisterDto))
  async clientRegister(@Body() registerData: ClientRegisterDto) {
      try {
        return await this.authService.clientRegister(
          registerData.name,
          registerData.email,
          registerData.password,
          registerData.phone1,
          registerData.ville,
          registerData.address
        );
      } catch (error) {
          if (error.message === 'EMAIL_EXISTS') {
              throw new HttpException(
                  { 
                      status: 'error',
                      code: 'EMAIL_EXISTS',
                      message: 'This email is already registered' 
                  },
                  HttpStatus.BAD_REQUEST
              );
          }
          else if (error.message.startsWith('VALIDATION:')) {
              throw new HttpException(
                  { 
                      status: 'error',
                      code: 'VALIDATION_ERROR',
                      message: error.message.replace('VALIDATION:', '').trim(),
                      field: error.message.split(':')[1]?.split(' ')[0]
                  },
                  HttpStatus.BAD_REQUEST
              );
          }
          else if (error.message === 'DUPLICATE_KEY') {
              throw new HttpException(
                  { 
                      status: 'error',
                      code: 'DUPLICATE_FIELD',
                      message: 'This phone number is already registered' 
                  },
                  HttpStatus.BAD_REQUEST
              );
          }
          else {
              throw new HttpException(
                  { 
                      status: 'error',
                      code: 'SERVER_ERROR',
                      message: 'Registration failed. Please try again later.' 
                  },
                  HttpStatus.INTERNAL_SERVER_ERROR
              );
          }
      }
  }

  @Post('admin/register')
@UsePipes(new ValidationPipe(AdminRegisterDto))
async adminRegister(@Body() registerData: AdminRegisterDto) {
  return this.authService.adminRegister(registerData);
}
}