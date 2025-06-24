import { Module } from '@nestjs/common';
import { AramexService } from './aramex.service';
import { AramexController } from './aramex.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Shipment, ShipmentSchema } from '../../models/shipment.schema';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    MongooseModule.forFeature([{ name: Shipment.name, schema: ShipmentSchema }]),
  ],
  controllers: [AramexController],
  providers: [AramexService],
  exports: [AramexService],
})
export class AramexModule {}