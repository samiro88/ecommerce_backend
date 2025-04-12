import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MessagesController } from './app.controller';
import { AppService } from './app.service';

// ======================
// ALL ORIGINAL IMPORTS PRESERVED
// ======================
import { AuthModule } from './routes/auth/auth.module';  // Correct path
import { BlogModule } from './routes/blog/blog.module';  // Correct path
import { CategoryModule } from './routes/category/category.module';  // Correct path
import { CloudinaryModule } from 'src/shared/utils/cloudinary/cloudinary/cloudinary.module';
import { ClientModule } from './routes/client/client.module';
import { InformationModule } from './routes/information/information.module';  // Correct path
import { MessagesModule } from './routes/messages/messages.module';  // Correct path
import { PacksModule } from './routes/packs/packs.module';  // Correct path
import { PagesModule } from './controllers/pages/pages.module';  // Correct path for PagesModule
import { ProductsModule } from './routes/products/products.module';
import { PromoCodesModule } from './routes/promo-codes/promo-codes.module';
import { SubCategoriesModule } from './routes/subcategories/subcategories.module';
import { VentesModule } from './routes/ventes/ventes.module';
import { DatabaseModule } from './db/database.module'; // Correct path
import { AnalyticsModule } from './routes/analytics/analytics.module';  // Correct path
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
import { GeneratorsModule } from './shared/utils/generators/reference/generators.module';  // Corrected path
import { SlugModule } from './shared/utils/generators/slug/slug.module'; // Replaces slugGenerator.js

@Module({
  imports: [

        // ======================
    // CONFIG MODULE (GLOBAL)
    // ======================
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule globally available
    }),

    // ======================
    // DATABASE (ORIGINAL)
    // ======================
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/protein_db'),
    DatabaseModule,

    // ======================
    // ALL ORIGINAL MODULES
    // ======================
    AuthModule,
    BlogModule,
    CategoryModule,
    CloudinaryModule, // Now uses shared config
    ClientModule,
    InformationModule,
    MessagesModule,
    PacksModule,
    PagesModule,
    ProductsModule,
    PromoCodesModule,
    SubCategoriesModule,
    VentesModule,
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
  controllers: [MessagesController],
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