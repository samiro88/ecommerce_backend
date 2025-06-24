// src/shared/utils/tokens/token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/token.interface';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  createToken(_id: string, role: string, expiresIn: string): string {
    const payload: TokenPayload = { _id, role };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}