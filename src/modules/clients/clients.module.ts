// clients.module.ts
import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientSchema } from './client.schema';
import { SmsService } from '../../services/sms.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Client', schema: ClientSchema }])],
  providers: [ClientsService , SmsService],
  controllers: [ClientsController],
})
export class ClientsModule {}
