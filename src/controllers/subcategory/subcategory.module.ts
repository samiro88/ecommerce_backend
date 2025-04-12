import { Module } from '@nestjs/common';
import { SubCategoriesController } from './subcategory.controller';
import { SubCategoriesService } from './subcategory.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubCategory, SubCategorySchema } from '../../models/sub-category.schema';
import { Category, CategorySchema } from '../../models/category.schema';          // Go back 2 directories
import { Product, ProductSchema } from '../../models/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategory.name, schema: SubCategorySchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService],
  exports: [SubCategoriesService],
})
export class SubCategoriesModule {}