import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubCategoriesController } from './subcategories.controller';
import { SubCategoriesService } from './subcategories.service';
import { SubCategory, SubCategorySchema } from '../../models/sub-category.schema';;
import { Category, CategorySchema } from '../../models/category.schema';;

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategory.name, schema: SubCategorySchema },
      { name: Category.name, schema: CategorySchema }, // Needed for category relations
    ]),
  ],
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService],
  exports: [SubCategoriesService], // Export if needed by other modules
})
export class SubCategoriesModule {}