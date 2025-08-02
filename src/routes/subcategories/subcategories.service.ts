import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { SubCategory } from '../../models/sub-category.schema';;
  import { Category } from '../../models/category.schema';;
  import mongoose from 'mongoose';
  
  @Injectable()
  export class SubCategoriesService {
    constructor(
      @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
      @InjectModel(Category.name) private categoryModel: Model<Category>,
    ) {}
  
    async createSubCategory(body: any) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        // Same validation as original
        const { name, categoryId } = body;
        if (!name || !categoryId) {
          throw new BadRequestException('Name and category ID are required');
        }
  
        // Check if category exists (same as original)
        const category = await this.categoryModel
          .findById(categoryId)
          .session(session);
        if (!category) {
          throw new NotFoundException('Category not found');
        }
  
        // Check for duplicate subcategory name (same as original)
        const existingSubCategory = await this.subCategoryModel
          .findOne({ name, category: categoryId })
          .session(session);
        if (existingSubCategory) {
          throw new BadRequestException('Subcategory already exists for this category');
        }
  
        // Same creation logic
        const newSubCategory = await this.subCategoryModel.create([{
          name,
          category: categoryId,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
        }], { session });
  
        await session.commitTransaction();
        return {
          success: true,
          message: 'Subcategory created successfully',
          data: newSubCategory[0],
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof BadRequestException || error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error creating subcategory');
      } finally {
        session.endSession();
      }
    }
  
    async deleteSubCategory(id: string) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        // Check if subcategory exists (same as original)
        const subCategory = await this.subCategoryModel
          .findByIdAndDelete(id)
          .session(session);
        if (!subCategory) {
          throw new NotFoundException('Subcategory not found');
        }
  
        await session.commitTransaction();
        return {
          success: true,
          message: 'Subcategory deleted successfully',
          data: subCategory,
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException('Error deleting subcategory');
      } finally {
        session.endSession();
      }
    }
  
    async updateSubCategory(id: string, body: any) {
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        // Check if subcategory exists (same as original)
        const subCategory = await this.subCategoryModel
          .findById(id)
          .session(session);
        if (!subCategory) {
          throw new NotFoundException('Subcategory not found');
        }
  
        // Same update logic
        if (body.name) {
          // Check for duplicate name (same as original)
          const existingSubCategory = await this.subCategoryModel
            .findOne({ 
              name: body.name, 
              category: subCategory.category,
              _id: { $ne: id } // Exclude current document
            })
            .session(session);
          if (existingSubCategory) {
            throw new BadRequestException('Subcategory name already exists for this category');
          }
  
          subCategory.name = body.name;
          subCategory.slug = body.name.toLowerCase().replace(/\s+/g, '-');
        }
  
        if (body.categoryId) {
          // Verify new category exists (same as original)
          const category = await this.categoryModel
            .findById(body.categoryId)
            .session(session);
          if (!category) {
            throw new NotFoundException('New category not found');
          }
          subCategory.category = body.categoryId;
        }
  
        await subCategory.save({ session });
        await session.commitTransaction();
  
        return {
          success: true,
          message: 'Subcategory updated successfully',
          data: subCategory,
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException('Error updating subcategory');
      } finally {
        session.endSession();
      }
    }


    async getSubCategoryById(id: string) {
  const subCategory = await this.subCategoryModel
    .findById(id)
    .populate('category', 'name designation designation_fr slug id');
  if (!subCategory) throw new NotFoundException('Subcategory not found');
  return {
    success: true,
    data: subCategory,
  };
}
  
    async getSubCategoriesByCategory(categoryId: string) {
      try {
        // Same validation as original
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          throw new BadRequestException('Invalid category ID');
        }
  
        // Same query logic
        const subCategories = await this.subCategoryModel
          .find({ category: categoryId })
          .sort({ name: 1 })
          .exec();
  
        return {
          success: true,
          data: subCategories,
        };
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new InternalServerErrorException('Error fetching subcategories by category');
      }
    }
  
    async getAllSubCategories() {
      try {
        // Same query logic as original
        const subCategories = await this.subCategoryModel
          .find()
          .populate('category', 'name') // Same population as original
          .sort({ name: 1 })
          .exec();
  
        return {
          success: true,
          data: subCategories,
        };
      } catch (error) {
        throw new InternalServerErrorException('Error fetching all subcategories');
      }
    }
  }