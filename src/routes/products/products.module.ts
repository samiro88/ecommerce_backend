import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from '../../models/product.schema';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VentesModule } from '../ventes/ventes.module';

@Module({
  imports: [
    forwardRef(() => VentesModule), // Use forwardRef for circular dependency
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10,
      },
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export ProductsService
})
export class ProductsModule {}