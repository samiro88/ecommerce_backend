// src/auth/auth.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { compare, hash } from 'bcryptjs';
import { AdminUser, AdminUserDocument } from '../../models/admin-user.schema'; // Correct path
import { Client, ClientDocument } from '../../models/client.schema';
import { TokenService } from '../../shared/utils/tokens/token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUserDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    private tokenService: TokenService,
  ) {}

  // Verify Admin User
  async verifyAdminUser(_id: string) {
    try {
      const user = await this.adminUserModel.findById(_id);
      if (!user) {
        throw new Error('User not registered OR Token malfunctioned');
      }

      return { message: 'Token is valid', user };
    } catch (error) {
      this.logger.error('Error verifying admin user', error);
      throw new Error('Internal Server Error');
    }
  }

  // Admin Login
  async adminLogin(username: string, password: string) {
    try {
      const adminUser = await this.adminUserModel.findOne({ userName: username });

      if (!adminUser) {
        throw new Error('User not registered');
      }

      const isPasswordCorrect = await compare(password, adminUser.password);
      if (!isPasswordCorrect) {
        throw new Error('Incorrect Password');
      }

      const token = this.tokenService.createToken(adminUser._id.toString(), adminUser.role, '30d');
      return {
        message: 'Logged in successfully',
        adminUsername: adminUser.userName,
        adminRole: adminUser.role,
        token,
      };
    } catch (error) {
      this.logger.error('Error during admin login', error);
      throw new Error('Internal Server Error');
    }
  }

  // Admin Logout
  async adminLogout(_id: string) {
    try {
      const user = await this.adminUserModel.findById(_id);
      if (!user || user._id.toString() !== _id) {
        throw new Error('Token not valid');
      }

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error('Error during admin logout', error);
      throw new Error('Internal Server Error');
    }
  }

  // Verify Client
  async verifyClient(_id: string) {
    try {
      const client = await this.clientModel.findById(_id);
      if (!client || client._id.toString() !== _id) {
        throw new Error('Token not valid');
      }
      return { message: 'Token is valid', user: client };
    } catch (error) {
      this.logger.error('Error verifying client', error);
      throw new Error('Internal Server Error');
    }
  }

  // Client Login
  async clientLogin(email: string, password: string) {
    try {
      const client = await this.clientModel.findOne({ email });
      if (!client) {
        throw new Error('User not registered');
      }

      const isPasswordCorrect = await compare(password, client.password);
      if (!isPasswordCorrect) {
        throw new Error('Incorrect Password');
      }

      const token = this.tokenService.createToken(client._id.toString(), 'client', '30d');
      const clientObj = client.toObject();
      delete (clientObj as any).password;

      return {
        status: 'ok',
        message: 'Logged in successfully',
        user: clientObj,
        token,
      };
    } catch (error) {
      this.logger.error('Error during client login', error);
      throw new Error('Internal Server Error');
    }
  }

  // Client Register
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
          throw new Error('Email already registered');
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
      this.logger.error('Error during client registration', error);
      throw new Error('Internal Server Error');
    }
  }

  // Client Logout
  async clientLogout(_id: string) {
    try {
      const client = await this.clientModel.findById(_id);
      if (!client || client._id.toString() !== _id) {
        throw new Error('Token not valid');
      }
      return { status: 'ok', message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error('Error during client logout', error);
      throw new Error('Internal Server Error');
    }
  }
}