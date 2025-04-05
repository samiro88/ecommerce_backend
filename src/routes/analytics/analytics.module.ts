import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Product, ProductSchema } from '../models/Product';
import { Category, CategorySchema } from '../models/Category';
import { PromoCode, PromoCodeSchema } from '../models/PromoCode';
import { Ventes, VentesSchema } from '../models/Ventes';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
      { name: Ventes.name, schema: VentesSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}