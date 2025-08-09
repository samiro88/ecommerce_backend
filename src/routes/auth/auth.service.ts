import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { compare, hash } from 'bcryptjs';
import { AdminUser, AdminUserDocument } from '../../models/admin-user.schema';
import { Client, ClientDocument } from '../../models/client.schema';
import { TokenService } from '../../shared/utils/tokens/token.service';
import { ClientLoginResponse } from '../../shared/utils/tokens/interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUserDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    private tokenService: TokenService,
  ) {}

  async validateUser(payload: any): Promise<any> {
    const adminUser = await this.adminUserModel.findById(payload.sub);
    if (adminUser) {
      return adminUser;
    }

    const client = await this.clientModel.findById(payload.sub);
    if (client) {
      return client;
    }

    return null;
  }

  // Verify Admin User
  async verifyAdminUser(_id: string) {
    try {
      const user = await this.adminUserModel.findById(_id);
      if (!user) {
        throw new HttpException(
          { status: 'error', code: 'USER_NOT_FOUND', message: 'User not registered OR Token malfunctioned' },
          HttpStatus.BAD_REQUEST
        );
      }

      return { message: 'Token is valid', user };
    } catch (error) {
      this.logger.error('Error verifying admin user', error);
      throw new HttpException(
        { status: 'error', code: 'SERVER_ERROR', message: 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Admin Login (username or email)
  async adminLogin(identifier: string, password: string) {
    try {
      const adminUser = await this.adminUserModel.findOne({
        $or: [{ userName: identifier }, { email: identifier }]
      });

      if (!adminUser) {
        throw new HttpException(
          { status: 'error', code: 'USER_NOT_FOUND', message: 'User not registered' },
          HttpStatus.BAD_REQUEST
        );
      }

      const isPasswordCorrect = await compare(password, adminUser.password);
      if (!isPasswordCorrect) {
        throw new HttpException(
          { status: 'error', code: 'INCORRECT_PASSWORD', message: 'Incorrect Password' },
          HttpStatus.BAD_REQUEST
        );
      }

      const tokenExpiration = '7d';
      const token = this.tokenService.createToken(adminUser._id.toString(), adminUser.role, tokenExpiration);
      return {
        message: 'Logged in successfully',
        adminUsername: adminUser.userName,
        adminRole: adminUser.role,
        token,
      };
    } catch (error) {
      this.logger.error('Error during admin login', error);
      throw new HttpException(
        { status: 'error', code: 'SERVER_ERROR', message: 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Admin Register (username and email must be unique)
  async adminRegister(registerData: { username: string; email: string; password: string; role?: string }) {
    const { username, email, password, role = "admin" } = registerData;
    // Check if username or email already exists
    const existing = await this.adminUserModel.findOne({
      $or: [{ userName: username }, { email }]
    });
    if (existing) {
      throw new HttpException(
        { status: 'error', code: 'USERNAME_OR_EMAIL_EXISTS', message: 'Username or email already exists' },
        HttpStatus.BAD_REQUEST
      );
    }
    const hashedPassword = await hash(password, 10);
    const newAdmin = new this.adminUserModel({
      userName: username,
      email,
      password: hashedPassword,
      role,
    });
    await newAdmin.save();
    const token = this.tokenService.createToken(newAdmin._id.toString(), newAdmin.role, '7d');
    return {
      message: 'Admin registered successfully',
      adminUsername: newAdmin.userName,
      adminRole: newAdmin.role,
      token,
    };
  }

  // Admin Logout
  async adminLogout(_id: string) {
    try {
      const user = await this.adminUserModel.findById(_id);
      if (!user || user._id.toString() !== _id) {
        throw new HttpException(
          { status: 'error', code: 'INVALID_TOKEN', message: 'Token not valid' },
          HttpStatus.BAD_REQUEST
        );
      }

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error('Error during admin logout', error);
      throw new HttpException(
        { status: 'error', code: 'SERVER_ERROR', message: 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Verify Client
  async verifyClient(_id: string) {
    try {
      const client = await this.clientModel.findById(_id);
      if (!client || client._id.toString() !== _id) {
        throw new HttpException(
          { status: 'error', code: 'INVALID_TOKEN', message: 'Token not valid' },
          HttpStatus.BAD_REQUEST
        );
      }
      return { message: 'Token is valid', user: client };
    } catch (error) {
      this.logger.error('Error verifying client', error);
      throw new HttpException(
        { status: 'error', code: 'SERVER_ERROR', message: 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async clientLogin(credentials: { email: string; password: string }): Promise<ClientLoginResponse> {
    try {
      const { email, password } = credentials;
      const client = await this.clientModel.findOne({ email });
  
      if (!client) {
        throw new HttpException(
          { status: 'error', code: 'USER_NOT_FOUND', message: 'User not registered' },
          HttpStatus.BAD_REQUEST
        );
      }
  
      const isPasswordCorrect = await compare(password, client.password);
      if (!isPasswordCorrect) {
        throw new HttpException(
          { status: 'error', code: 'INCORRECT_PASSWORD', message: 'Incorrect Password' },
          HttpStatus.BAD_REQUEST
        );
      }
  
      const token = this.tokenService.createToken(client._id.toString(), 'client', '30d');
      const clientObj = client.toObject();
      delete (clientObj as any).password;
  
      return {
        status: 'ok',
        message: 'Login successful',
        user: {
          id: clientObj._id.toString(),
          email: clientObj.email,
          name: clientObj.name,
          phone1: clientObj.phone1,
          ville: clientObj.ville,
          address: clientObj.address,
        },
        token,
      };
    } catch (error) {
      this.logger.error('Error during client login', error);
      throw new HttpException(
        { status: 'error', code: 'SERVER_ERROR', message: 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  // Client Register - IMPROVED VERSION
  async clientRegister(name: string, email: string, password: string, phone1: string, ville: string, address: string) {
    try {
      const existingClient = await this.clientModel.findOne({ email });

      if (existingClient) {
        if (existingClient.isGuest) {
          existingClient.name = name;
          existingClient.password = await hash(password, 10);
          existingClient.phone1 = phone1;
          existingClient.ville = ville;
          existingClient.address = address;
          existingClient.isGuest = false;

          await existingClient.save();
          const token = this.tokenService.createToken(existingClient._id.toString(), 'client', '30d');
          const clientObj = existingClient.toObject();
          delete (clientObj as any).password;

          return {
            status: 'ok',
            message: 'Registered successfully. Previous guest orders have been linked to your account.',
            user: clientObj,
            token,
          };
        } else {
          throw new HttpException(
            { status: 'error', code: 'EMAIL_EXISTS', message: 'This email is already registered' },
            HttpStatus.BAD_REQUEST
          );
        }
      }

      const hashedPassword = await hash(password, 10);
      const newClient = new this.clientModel({
        name,
        email,
        password: hashedPassword,
        phone1,
        ville,
        address,
        isGuest: false,
      });

      await newClient.save();

      const token = this.tokenService.createToken(newClient._id.toString(), 'client', '30d');
      const clientObj = newClient.toObject();
      delete (clientObj as any).password;

      return {
        status: 'ok',
        message: 'Registered successfully',
        user: clientObj,
        token,
      };
    } catch (error) {
      this.logger.error('Registration failed', {
        email,
        error: error.message,
        validationErrors: error.errors,
      });

      if (error.code === 11000 || error.message.includes('E11000')) {
        throw new HttpException(
          { status: 'error', code: 'DUPLICATE_KEY', message: 'Duplicate email found' },
          HttpStatus.BAD_REQUEST
        );
      }

      if (error.name === 'ValidationError') {
        const firstError = Object.values(error.errors)[0] as { message: string };
        throw new HttpException(
          { status: 'error', code: 'VALIDATION_ERROR', message: firstError.message },
          HttpStatus.BAD_REQUEST
        );
      }

      if (['EMAIL_EXISTS', 'DUPLICATE_KEY'].includes(error.message)) {
        throw error;
      }

      throw new HttpException(
        { status: 'error', code: 'SERVER_ERROR', message: `SERVER:${error.message}` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Client Logout
  async clientLogout(_id: string) {
    try {
      const client = await this.clientModel.findById(_id);
      if (!client || client._id.toString() !== _id) {
        throw new HttpException(
          { status: 'error', code: 'INVALID_TOKEN', message: 'Token not valid' },
          HttpStatus.BAD_REQUEST
        );
      }
      return { status: 'ok', message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error('Error during client logout', error);
      throw new HttpException(
        { status: 'error', code: 'SERVER_ERROR', message: 'Internal Server Error' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}