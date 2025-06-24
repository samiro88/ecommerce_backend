// src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { PaymeModule } from './payme/payme.module';

@Module({
  imports: [PaymeModule],
})
export class PaymentsModule {}