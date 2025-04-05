import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model, ClientSession } from 'mongoose';
  import { SubCategory } from '../models/SubCategory';
  import { Category } from '../models/Category';
  import { Product } from '../models/Product';
  import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
  import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
  import { InjectConnection } from '@nestjs/mongoose';
  import * as mongoose from 'mongoose';
  
  @Injectable()
  export class SubCategoriesService {
    constructor(
      @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
      @InjectModel(Category.name) private categoryModel: Model<Category>,
      @InjectModel(Product.name) private productModel: Model<Product>,
      @InjectConnection() private readonly connection: mongoose.Connection,
    ) {}
  
    async create(createSubCategoryDto: CreateSubCategoryDto) {
      const session = await this.connection.startSession();
      session.startTransaction();
  
      try {
        // Validate that the category exists
        const category = await this.categoryModel
          .findById(createSubCategoryDto.categoryId)
          .session(session);
        if (!category) {
          throw new NotFoundException('Category not found');
        }
  
        // Create the sub-category
        const [newSubCategory] = await this.subCategoryModel.create(
          [
            {
              designation: createSubCategoryDto.designation,
              category: createSubCategoryDto.categoryId,
              products: [],
            },
          ],
          { session },
        );
  
        // Update the category to include this sub-category
        await this.categoryModel.findByIdAndUpdate(
          createSubCategoryDto.categoryId,
          {
            $push: { subCategories: newSubCategory._id },
            updatedAt: Date.now(),
          },
          { session },
        );
  
        await session.commitTransaction();
  
        return {
          message: 'Sub-category created successfully',
          data: newSubCategory,
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  
    async findAll() {
      const subCategories = await this.subCategoryModel
        .find()
        .populate('category', 'designation')
        .sort('-createdAt')
        .exec();
  
      return {
        message: 'All subcategories fetched successfully',
        data: subCategories,
      };
    }
  
    async findByCategory(categoryId: string) {
      const subCategories = await this.subCategoryModel
        .find({ category: categoryId })
        .populate('category', 'designation')
        .sort('-createdAt')
        .exec();
  
      if (!subCategories || subCategories.length === 0) {
        throw new NotFoundException(
          'No subcategories found for this category',
        );
      }
  
      return {
        message: 'Subcategories fetched successfully',
        data: subCategories,
      };
    }
  
    async update(id: string, updateSubCategoryDto: UpdateSubCategoryDto) {
      const session = await this.connection.startSession();
      session.startTransaction();
  
      try {
        const subCategory = await this.subCategoryModel
          .findById(id)
          .session(session);
        if (!subCategory) {
          throw new NotFoundException('Subcategory not found');
        }
  
        subCategory.designation = updateSubCategoryDto.designation;
        subCategory.updatedAt = Date.now();
  
        await subCategory.save({ session });
  
        await session.commitTransaction();
  
        return {
          message: 'Subcategory updated successfully',
          data: subCategory,
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  
    async remove(id: string) {
      const session = await this.connection.startSession();
      session.startTransaction();
  
      try {
        const subCategory = await this.subCategoryModel
          .findById(id)
          .session(session);
        if (!subCategory) {
          throw new NotFoundException('Subcategory not found');
        }
  
        if (subCategory.products.length > 0) {
          await this.productModel.updateMany(
            { subCategory: id },
            { $pull: { subCategory: id } },
            { session },
          );
        }
  
        if (subCategory.category) {
          await this.categoryModel.findByIdAndUpdate(
            subCategory.category,
            { $pull: { subCategories: id } },
            { session },
          );
        }
  
        await this.subCategoryModel.findByIdAndDelete(id, { session });
  
        await session.commitTransaction();
  
        return {
          message: 'Subcategory deleted successfully',
          data: subCategory,
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  }