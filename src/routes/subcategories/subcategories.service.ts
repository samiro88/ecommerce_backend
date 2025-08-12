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
        const { name, categoryId } = body;
        let category: any = null;
        
        // Only validate category if provided
        if (categoryId) {
          category = await this.categoryModel
            .findById(categoryId)
            .session(session);
          if (!category) {
            throw new NotFoundException('Category not found');
          }
        }
  
        // Create subcategory with all provided fields matching schema
        const subcategoryData = {
          designation: body.designation || body.designation_fr || '',
          designation_fr: body.designation_fr || '',
          name: body.name || body.designation_fr || '',
          slug: body.slug || (body.name || body.designation_fr ? (body.name || body.designation_fr).toLowerCase().replace(/\s+/g, '-') : ''),
          category: categoryId || null,
          categorie_id: category?.id || null,
          cover: body.cover || null,
          alt_cover: body.alt_cover || null,
          description_cove: body.description_cove || null,
          meta: body.meta || null,
          content_seo: body.content_seo || null,
          description_fr: body.description_fr || null,
          review: body.review || null,
          aggregateRating: body.aggregateRating || null,
          nutrition_values: body.nutrition_values || null,
          questions: body.questions || null,
          more_details: body.more_details || null,
          zone1: body.zone1 || null,
          zone2: body.zone2 || null,
          zone3: body.zone3 || null,
          zone4: body.zone4 || null,
        };
  
        const newSubCategory = await this.subCategoryModel.create([subcategoryData], { session });
  
        await session.commitTransaction();
        return {
          success: true,
          message: 'Subcategory created successfully',
          data: newSubCategory[0],
        };
      } catch (error) {
        await session.abortTransaction();
        if (error instanceof NotFoundException) {
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
        const subCategory = await this.subCategoryModel
          .findById(id)
          .session(session);
        if (!subCategory) {
          throw new NotFoundException('Subcategory not found');
        }
  
        // Update all provided fields
        if (body.name !== undefined) subCategory.name = body.name;
        if (body.designation !== undefined) subCategory.designation = body.designation;
        if (body.designation_fr !== undefined) subCategory.designation_fr = body.designation_fr;
        if (body.description_fr !== undefined) subCategory.description_fr = body.description_fr;
        if (body.slug !== undefined) subCategory.slug = body.slug;
        if (body.alt_cover !== undefined) subCategory.alt_cover = body.alt_cover;
        if (body.description_cove !== undefined) subCategory.description_cove = body.description_cove;
        if (body.meta !== undefined) subCategory.meta = body.meta;
        if (body.content_seo !== undefined) subCategory.content_seo = body.content_seo;
        if (body.review !== undefined) subCategory.review = body.review;
        if (body.aggregateRating !== undefined) subCategory.aggregateRating = body.aggregateRating;
        if (body.nutrition_values !== undefined) subCategory.nutrition_values = body.nutrition_values;
        if (body.questions !== undefined) subCategory.questions = body.questions;
        if (body.more_details !== undefined) subCategory.more_details = body.more_details;
        if (body.zone1 !== undefined) subCategory.zone1 = body.zone1;
        if (body.zone2 !== undefined) subCategory.zone2 = body.zone2;
        if (body.zone3 !== undefined) subCategory.zone3 = body.zone3;
        if (body.zone4 !== undefined) subCategory.zone4 = body.zone4;
  
        // Update timestamp
        subCategory.updatedAt = new Date();
  
        if (body.categoryId) {
          const category = await this.categoryModel
            .findById(body.categoryId)
            .session(session);
          if (category) {
            subCategory.category = body.categoryId;
            subCategory.categorie_id = category?.id;
          }
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
        if (error instanceof NotFoundException) {
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