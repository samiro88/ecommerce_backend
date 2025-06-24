import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsController } from './products.controller';
import { ProductsService } from './product.service';
import { Product, ProductSchema } from '../../models/product.schema';
import { Category, CategorySchema } from '../../models/category.schema';
import { SubCategory, SubCategorySchema } from '../../models/sub-category.schema';
import { CloudinaryProvider } from '../../controllers/cloudinary/cloudinary.provider';
import { VentesModule } from '../ventes/vente.module';
import { RedisService } from '../../shared/utils/redis/redis.service'; // Redis service for caching
import { Review, ReviewSchema } from '../../models/reviews.schema';
@Module({
  imports: [
    // Configuration (from first file)
    ConfigModule.forRoot({
      isGlobal: true, // Make config available across the app
      envFilePath: '.env' // Specify env file path
    }),

    // Database models (combined from both files)
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubCategorySchema },
      { name: 'Review', schema: ReviewSchema }, // <-- ADD THIS LINE
    ]),

    // File upload (from second file)
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10 // Max 10 files
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      }
    }),

    // Circular dependency handling (from both files)
    forwardRef(() => VentesModule)
  ],
  controllers: [ProductsController],
  providers: [
    // Original service implementation (from first file)
    ProductsService,

    // Alternative provider token (from second file)
    {
      provide: 'PRODUCTS_SERVICE',
      useClass: ProductsService
    },

    // Cloudinary integration (from first file)
    CloudinaryProvider,

    // Redis integration (from first file)
    RedisService,

    // Additional providers if any...
  ],
  exports: [
    // Service exports (combined from both files)
    ProductsService,
    'PRODUCTS_SERVICE',

    // Module exports (from second file)
    MongooseModule,

    // Make Multer configuration available if needed
    MulterModule
  ]
})
export class ProductsModule {}