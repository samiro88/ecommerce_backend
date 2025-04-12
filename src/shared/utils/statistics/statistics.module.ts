// src/shared/utils/statistics/statistics.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vente, VenteSchema } from '../../../models/vente.schema';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vente.name, schema: VenteSchema }])
  ],
  providers: [StatisticsService],
  exports: [StatisticsService]
})
export class StatisticsModule {}