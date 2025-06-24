// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../routes/auth/auth.module';  
import { ProductsModule } from '../modules/products/products.module';  
import { CategoryModule } from '../routes/category/category.module';  
import { SubCategoriesModule } from '../modules/subcategory/subcategory.module';  
import { ClientsModule } from '../modules/clients/clients.module';  
import { VentesModule } from '../modules/ventes/vente.module';  
import { PacksModule } from '../routes/packs/packs.module';  
import { PromoCodesModule } from '../routes/promo-codes/promo-codes.module';  
import { InformationModule } from '../modules/information/information.module';  
import { AnalyticsModule } from '../modules/analytics/analytics.module';  
import { BlogModule } from '../modules/blog/blog.module'; 
import { MessagesModule } from '../modules/messages/messages.module';  
import { PagesModule } from '../modules/pages/pages.module';  

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    CategoryModule,
    SubCategoriesModule,
    ClientsModule,
    VentesModule,
    PacksModule,  
    PromoCodesModule,  
    InformationModule,
    AnalyticsModule,
    BlogModule,
    MessagesModule,
    PagesModule,
  ],
})
export class AdminModule {}
