import { Module, MiddlewareConsumer, NestModule , RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as bodyParser from 'body-parser';
import { FileUploadService } from './services/file-upload.service';
import { FileUploadController } from './controllers/file-upload.controller'; 
import { CorsMiddleware } from './cors.middleware';
// ======================
// ALL ORIGINAL IMPORTS PRESERVED
// ======================
import { AuthModule } from './routes/auth/auth.module';
import { BlogModule } from './modules/blog/blog.module';
import { CategoryModule } from './modules/category/category.module';
import { CloudinaryModule } from 'src/shared/utils/cloudinary/cloudinary/cloudinary.module';
import { ClientModule } from './routes/client/client.module';
import { InformationModule } from './routes/information/information.module';
import { MessagesModule } from './routes/messages/messages.module';
import { PacksModule } from './routes/packs/packs.module';
import { PagesModule } from './modules/pages/pages.module';
import { ProductsModule } from './modules/products/products.module';
import { PromoCodesModule } from './routes/promo-codes/promo-codes.module';
import { SubCategoriesModule } from './routes/subcategories/subcategories.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { VentesModule } from './routes/ventes/ventes.module';
import { DatabaseModule } from './db/database.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { VenteFlashModule } from './modules/vente-flash/vente-flash.module';
import { VenteFlashSchema } from './models/vente-flash.schema';
import { MusculationProductModule } from './modules/MusculationProducts/MusculationProducts.module';
import { BrandsModule } from './modules/brands/brands.module';
import { AromasModule } from './modules/aromas/aromas.module';
import { UserModule } from './modules/user/user.module';
import { BannerModule } from './modules/banner/banner.module';
// ======================
// NEW MODULES ADDED HERE (PRESERVING ALPHABETICAL ORDER)
// ======================
import { ExportModule } from './export/export.module';
import { TasksModule } from './tasks/tasks.module';

// ======================
// MIDDLEWARES (ORIGINAL)
// ======================
import { MulterMiddleware } from './middleware/multer.middleware';
import { ValidateObjectIdMiddleware } from './middleware/validate-id.middleware';

// ======================
// UTILITY MODULES (NEW ORGANIZATION)
// ======================
import { TokenModule } from './shared/utils/tokens/token.module';
import { CryptoModule } from './shared/utils/crypto/crypto.module';
import { StatisticsModule } from './shared/utils/statistics/statistics.module';
import { GeneratorsModule } from './shared/utils/generators/reference/generators.module';
import { SlugModule } from './shared/utils/generators/slug/slug.module';
import { Attachment, AttachmentSchema } from './models/attachment.schema';
import { MediaCompressionModule } from './shared/utils/media-compression/media-compression.module';
import { CommandeModule } from './modules/commande/commande.module';
import { AramexModule } from './modules/aramex/aramex.module';
// ======================
// EMAIL SYSTEM (NEW)
// ======================
import { EmailService } from './services/email.service';
import { EmailController } from './controllers/email.controller';
import { NotificationController } from './controllers/notification.controller';
import { SmsService } from './services/sms.service';
import { WhatsappService } from './services/whatsapp.service';

// ======================
// preview module (NEW)
// ======================
import { PreviewModule } from './templates/preview/preview.module';
import { InvoiceModule } from './modules/invoice/invoice.module';


// ======================
//payments module (NEW)
// ======================
import { PaymentsModule } from './payments/payments.module';
import { PaymeModule } from './payments/payme/payme.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
// Redis imports
//import { RedisModule } from '@liaoliaots/nestjs-redis';



// ======================

import { DashboardModule } from './modules/analytics/dashboard.module';

@Module({
  imports: [
    // ======================
    // CONFIG MODULE (GLOBAL)
    // ======================
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ======================
    // REDIS MODULE
    // ======================
    // TODO: Uncomment and configure Redis in production for session management, caching, etc.
    /*
    RedisModule.forRoot({
      readyLog: true,
      config: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      }
    }),
    */

    // ======================
    // DATABASE (ORIGINAL)
    // ======================
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/protein_db'),
    DatabaseModule,

    // ======================
    // ALL ORIGINAL MODULES (WITH NEW MODULES INSERTED ALPHABETICALLY)
    // ======================
   
    AdminModule,
    AnalyticsModule,
    AuthModule,
    BlogModule,
    CategoryModule,
    AramexModule,
    ClientModule,
    CloudinaryModule,
    ExportModule, // NEW
    InformationModule,
    InvoiceModule,
    PaymentMethodsModule,
    // ======================
    MessagesModule,
    PacksModule,
    PagesModule,
    ProductsModule,
    PromoCodesModule,
    SubCategoriesModule,
    TasksModule, // NEW
    VentesModule,
    MediaCompressionModule, // NEW
    VenteFlashModule, //new 
    MusculationProductModule,
    AromasModule, // NEW
    BrandsModule, // NEW
    ReviewsModule, // NEW
    CommandeModule,
 UserModule,
    // ======================
    // NEW UTILITY MODULES
    // ======================
    CryptoModule,
    GeneratorsModule,
    SlugModule,
    StatisticsModule,
    TokenModule,
    // ======================
    // EMAIL SYSTEM MODULES demo 
    // ======================
    PreviewModule, // NEW

    // ======================
    // PAYMENTS MODULES
    // ======================
    PaymentsModule, // NEW
    PaymeModule, // NEW

 BannerModule,
    //dahboard module 
    DashboardModule, // NEW
    
    // ======================
    // ATTACHMENT MODEL
    // ======================
    MongooseModule.forFeature([
      { name: Attachment.name, schema: AttachmentSchema },
      { name: 'VenteFlash', schema: VenteFlashSchema },
    ]),
  ],
  controllers: [ AppController, FileUploadController , EmailController , NotificationController],
  // ======================   
  // ======================
  providers: [AppService, FileUploadService , EmailService, SmsService, WhatsappService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(bodyParser.json(), bodyParser.urlencoded({ extended: true }))
      .forRoutes('*');

    consumer
      .apply(MulterMiddleware)
      .forRoutes(
        'products/*',
        'categories/*',
        'pages/*',
        'blogs/*',
        'file-upload',
        'categories',
        'vente-flash/*',
        'musculation-products/*',
       
      )
      .apply(ValidateObjectIdMiddleware)
      .forRoutes(
        'products',
        'categories',
        'subcategories',
        'pages',
        'blogs',
        'blogs/*',
        'vente-flash',    

      );
      consumer
      .apply(CorsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}