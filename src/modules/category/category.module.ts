import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from "../../models/category.schema";
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CloudinaryModule } from '../../controllers/cloudinary/cloudinary.module';  // ✅ Import CloudinaryModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    CloudinaryModule,  // ✅ Ensure CloudinaryModule is imported
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
