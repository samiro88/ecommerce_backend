import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCodesService } from './promo-codes.service';
import { PromoCode, PromoCodeSchema } from '../models/PromoCode';
import { VentesModule } from '../ventes/ventes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PromoCode.name, schema: PromoCodeSchema }]),
    VentesModule, // For validatePromoCode functionality
  ],
  controllers: [PromoCodesController],
  providers: [PromoCodesService],
  exports: [PromoCodesService], // Export if needed by other modules
})
export class PromoCodesModule {}