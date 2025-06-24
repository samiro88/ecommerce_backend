import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from '../../controllers/analytics.controller';
import { AnalyticsService } from '../../services/analytics.service';
import { SalesService } from '../../controllers/sales.service';
import { StatisticsService } from 'src/shared/utils/statistics/statistics.service';
import { Invoice, InvoiceSchema } from 'src/models/invoice.schema'; // <-- ADD THIS
import { Product, ProductSchema } from 'src/models/product.schema';
import { Category, CategorySchema } from 'src/models/category.schema';
import { PromoCode, PromoCodeSchema } from 'src/models/promo-code.schema';
import { Vente, VenteSchema } from 'src/models/vente.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema }, // <-- ADD THIS
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
      { name: Vente.name, schema: VenteSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    SalesService,
    StatisticsService,
  ],
  exports: [AnalyticsService, SalesService, StatisticsService],
})
export class AnalyticsModule {}