import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProductsController } from './product.controller';
import { ProductsService } from './product.service';
import { Product, ProductSchema } from 'src/models/product.schema';
import { Category, CategorySchema } from 'src/models/category.schema';
import { SubCategory, SubCategorySchema } from '../../models/sub-category.schema';
import { CloudinaryProvider } from 'src/controllers/cloudinary/cloudinary.provider';
import { VentesModule } from '../vente/vente.module'; // Add this import

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
    forwardRef(() => VentesModule), // Add this line
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CloudinaryProvider],
  exports: [ProductsService], // Add this if other modules need ProductsService
})
export class ProductsModule {}