// src/shared/utils/tokens/token.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { 
        // Default options can be set here
      }
    })
  ],
  providers: [TokenService],
  exports: [TokenService]
})
export class TokenModule {}