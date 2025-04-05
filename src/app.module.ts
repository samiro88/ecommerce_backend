import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// ======================
// ALL ORIGINAL IMPORTS PRESERVED
// ======================
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { CategoryModule } from './category/category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ClientsModule } from './clients/clients.module';
import { InformationModule } from './information/information.module';
import { MessagesModule } from './messages/messages.module';
import { PacksModule } from './packs/packs.module';
import { PagesModule } from './pages/pages.module';
import { ProductModule } from './product/product.module';
import { PromoCodeModule } from './promo-code/promo-code.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
import { VenteModule } from './vente/vente.module';
import { DatabaseModule } from './db/database.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';

// ======================
// MIDDLEWARES (ORIGINAL)
// ======================
import { MulterMiddleware } from './middleware/multer.middleware';
import { ValidateObjectIdMiddleware } from './middleware/validate-id.middleware';

// ======================
// UTILITY MODULES (NEW ORGANIZATION)
// ======================
import { TokenModule } from './shared/utils/tokens/token.module'; // Replaces tokenManager.js
import { CryptoModule } from './shared/utils/crypto/crypto.module'; // Replaces hashing.js
import { StatisticsModule } from './shared/utils/statistics/statistics.module'; // Replaces statistique.js
import { GeneratorsModule } from './shared/utils/generators/generators.module'; // Replaces generateReference.js
import { SlugModule } from './shared/utils/generators/slug/slug.module'; // Replaces slugGenerator.js

@Module({
  imports: [
    // ======================
    // DATABASE (ORIGINAL)
    // ======================
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/nest'),
    DatabaseModule,

    // ======================
    // ALL ORIGINAL MODULES
    // ======================
    AuthModule,
    BlogModule,
    CategoryModule,
    CloudinaryModule, // Now uses shared config
    ClientsModule,
    InformationModule,
    MessagesModule,
    PacksModule,
    PagesModule,
    ProductModule,
    PromoCodeModule,
    SubcategoryModule,
    VenteModule,
    AnalyticsModule,
    AdminModule,

    // ======================
    // NEW UTILITY MODULES
    // ======================
    TokenModule,
    CryptoModule,
    StatisticsModule,
    GeneratorsModule,
    SlugModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // ======================
    // ORIGINAL MIDDLEWARE
    // ======================
    consumer
      .apply(MulterMiddleware)
      .forRoutes(
        'products*',
        'categories*',
        'pages*'
      )
      .apply(ValidateObjectIdMiddleware)
      .forRoutes(
        'products',
        'categories',
        'subcategories'
      );
  }
}