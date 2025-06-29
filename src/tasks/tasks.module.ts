
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ExportModule } from '../export/export.module';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsModule } from '../modules/analytics/analytics.module';
import { AnalyticsService } from '../services/analytics.service';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { InvoiceSchema } from '../models/invoice.schema';

// Import the schemas for Product, Category, PromoCode, and Vente
import { Product, ProductSchema } from '../models/product.schema';
import { Category, CategorySchema } from '../models/category.schema';
import { PromoCode, PromoCodeSchema } from '../models/promo-code.schema';
import { Vente, VenteSchema } from '../models/vente.schema';

@Module({
  imports: [
    ExportModule,
    ConfigModule,
    AnalyticsModule,
    MongooseModule.forFeature([
      { name: 'Invoice', schema: InvoiceSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: PromoCode.name, schema: PromoCodeSchema },
      { name: Vente.name, schema: VenteSchema },
    ]),
  ],
  providers: [
    TasksService,
    AnalyticsService,
    {
      provide: 'DATABASE_CONNECTION',
      useExisting: getConnectionToken(),
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}
