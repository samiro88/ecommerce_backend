import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async verifyAdminUser(token: string) {
    // Implement your existing verifyAdminUser logic here
  }

  async adminLogin(loginData: any) {
    // Implement your existing adminLogin logic here
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
}