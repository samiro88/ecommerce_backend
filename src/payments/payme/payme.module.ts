import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymeController } from './payme.controller';
import { PaymeService } from './payme.service';
import { EmailService } from './email.service'; 
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { PaymeeAdminController } from './paymee-admin.controller';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
  ],
  controllers: [PaymeController , PaymeeAdminController],
  providers: [PaymeService, EmailService], 
  exports: [PaymeService],
})
export class PaymeModule {}
