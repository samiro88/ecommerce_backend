
import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AdminUser, AdminUserDocument } from '../../models/admin-user.schema';
import { hash, compare } from 'bcryptjs';
import { TokenService } from '../../shared/utils/tokens/token.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUserDocument>,
    private tokenService: TokenService,
  ) {}

  async verifyAdminUser(token: string) {
    // Implement your existing verifyAdminUser logic here
  }

  async adminLogin(loginData: { username: string; password: string }) {
    const { username, password } = loginData;
    const adminUser = await this.adminUserModel.findOne({ userName: username });
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
    const token = this.tokenService.createToken(adminUser._id.toString(), adminUser.role, '7d');
    return {
      message: 'Logged in successfully',
      adminUsername: adminUser.userName,
      adminRole: adminUser.role,
      token,
    };
  }

  async adminLogout(token: string) {
    // Implement your existing adminLogout logic here
  }

  async verifyClient(token: string) {
    // Implement your existing verifyClient logic here
  }

  async clientLogout(token: string) {
    // Implement your existing clientLogout logic here
  }

  async clientLogin(loginData: any) {
    // Implement your existing clientLogin logic here
  }

  async clientRegister(registerData: any) {
    // Implement your existing clientRegister logic here
  }

  // --- Admin Register Implementation ---
  async adminRegister(registerData: { username: string; password: string; role?: string }) {
    const { username, password, role = "admin" } = registerData;
    // Check if username already exists
    const existing = await this.adminUserModel.findOne({ userName: username });
    if (existing) {
      throw new HttpException(
        { status: 'error', code: 'USERNAME_EXISTS', message: 'Username already exists' },
        HttpStatus.BAD_REQUEST
      );
    }
    // Hash password
    const hashedPassword = await hash(password, 10);
    // Create new admin user
    const newAdmin = new this.adminUserModel({
      userName: username,
      password: hashedPassword,
      role,
    });
    await newAdmin.save();
    // Generate JWT token
    const token = this.tokenService.createToken(newAdmin._id.toString(), newAdmin.role, '7d');
    return {
      message: 'Admin registered successfully',
      adminUsername: newAdmin.userName,
      adminRole: newAdmin.role,
      token,
    };
  }
}
