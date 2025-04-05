// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../routes/auth/auth.module';  // From the routes
import { ProductsModule } from '../controllers/product/product.module';  // From the controllers
import { CategoryModule } from '../routes/category/category.module';  // From the routes
import { SubCategoriesModule } from '../controllers/subcategory/subcategory.module';  // From the controllers
import { ClientsModule } from '../controllers/clients/clients.module';  // From the controllers
import { VentesModule } from '../controllers/vente/vente.module';  // From the controllers
import { PacksModule } from '../routes/packs/packs.module';  // Corrected module name
import { PromoCodesModule } from '../routes/promo-codes/promo-codes.module';  // Corrected module name
import { InformationModule } from '../controllers/information/information.module';  // From the controllers
import { AnalyticsModule } from '../routes/analytics/analytics.module';  // From the routes
import { BlogModule } from '../routes/blog/blog.module';  // Corrected path to the routes folder
import { MessagesModule } from '../controllers/messages/messages.module';  // From the controllers
import { PagesModule } from '../controllers/pages/pages.module';  // From the controllers

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    CategoryModule,
    SubCategoriesModule,
    ClientsModule,
    VentesModule,
    PacksModule,  // Corrected from PackModule
    PromoCodesModule,  // Corrected from PromoCodeModule
    InformationModule,
    AnalyticsModule,
    BlogModule,
    MessagesModule,
    PagesModule,
  ],
})
export class AdminModule {}
