// src/shared/utils/crypto/crypto.module.ts
import { Module } from '@nestjs/common';
import { HashingService } from './hashing.service';

@Module({
  providers: [HashingService],
  exports: [HashingService]
})
export class CryptoModule {}