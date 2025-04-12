import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Product, ProductSchema } from 'src/models/product.schema';
import { Category, CategorySchema } from 'src/models/category.schema';
import { PromoCode, PromoCodeSchema } from 'src/models/promo-code.schema';
import { Vente, VenteSchema } from  'src/models/vente.schema'; // This import should work now

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
      { name: Vente.name, schema: VenteSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
