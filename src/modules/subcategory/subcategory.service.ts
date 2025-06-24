
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubCategory } from '../../models/sub-category.schema';
import { Category } from '../../models/category.schema';
import { Product } from '../../models/product.schema';
import { CreateSubCategoryDto } from '../dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from '../dto/update-sub-category.dto';
import * as mongoose from 'mongoose';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  /**
   * Create a new subcategory, supporting both legacy (categorie_id) and modern (category) references.
   */
  async create(createSubCategoryDto: CreateSubCategoryDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Validate that the category exists (by ObjectId or string)
      let category;
      if (mongoose.isValidObjectId(createSubCategoryDto.categoryId)) {
        category = await this.categoryModel.findById(createSubCategoryDto.categoryId).session(session);
      } else {
        category = await this.categoryModel.findOne({ id: createSubCategoryDto.categoryId }).session(session);
      }
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Create the sub-category with both references for compatibility
      const [newSubCategory] = await this.subCategoryModel.create(
        [
          {
            designation: createSubCategoryDto.designation,
            designation_fr: createSubCategoryDto.designation_fr,
            name: createSubCategoryDto.name,
            slug: createSubCategoryDto.slug,
            categorie_id: category.id, // string reference
            category: category._id,    // ObjectId reference
            products: [],
            cover: createSubCategoryDto.cover,
            alt_cover: createSubCategoryDto.alt_cover,
            description_cove: createSubCategoryDto.description_cove,
            meta: createSubCategoryDto.meta,
            content_seo: createSubCategoryDto.content_seo,
            description_fr: createSubCategoryDto.description_fr,
            review: createSubCategoryDto.review,
            aggregateRating: createSubCategoryDto.aggregateRating,
            nutrition_values: createSubCategoryDto.nutrition_values,
            questions: createSubCategoryDto.questions,
            more_details: createSubCategoryDto.more_details,
            zone1: createSubCategoryDto.zone1,
            zone2: createSubCategoryDto.zone2,
            zone3: createSubCategoryDto.zone3,
            zone4: createSubCategoryDto.zone4,
          },
        ],
        { session },
      );

      // Update the category to include this sub-category (if using subCategories array)
      await this.categoryModel.findByIdAndUpdate(
        category._id,
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

  /**
   * Get all subcategories, populating category info.
   */
  async findAll() {
    const subCategories = await this.subCategoryModel
      .find()
      .populate('category', 'designation designation_fr slug id')
      .sort('-createdAt')
      .exec();

    return {
      message: 'All subcategories fetched successfully',
      data: subCategories,
    };
  }

  /**
   * Find subcategories by category (supports both ObjectId and string id).
   */
  async findByCategory(categoryId: string) {
    // Build query dynamically for maximum compatibility
    let query: any = {};
    if (mongoose.isValidObjectId(categoryId)) {
      // If ObjectId, match either ObjectId or string id
      query = {
        $or: [
          { category: new mongoose.Types.ObjectId(categoryId) },
          { categorie_id: categoryId }
        ]
      };
    } else {
      // If string, match either string id or ObjectId as string
      query = {
        $or: [
          { categorie_id: categoryId },
          { category: categoryId }
        ]
      };
    }

    const subCategories = await this.subCategoryModel
      .find(query)
      .populate('category', 'designation designation_fr slug id')
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

  /**
   * Update a subcategory, supporting all fields.
   */
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

      // Update all fields if provided
      Object.assign(subCategory, updateSubCategoryDto, {
        updatedAt: new Date(),
      });

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

  /**
   * Remove a subcategory and clean up references in products and categories.
   */
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

      // Remove subcategory reference from products
      if (subCategory.products && subCategory.products.length > 0) {
        await this.productModel.updateMany(
          { subCategory: id },
          { $pull: { subCategory: id } },
          { session },
        );
      }

      // Remove subcategory reference from category (both ObjectId and string)
      if (subCategory.category) {
        await this.categoryModel.findByIdAndUpdate(
          subCategory.category,
          { $pull: { subCategories: id } },
          { session },
        );
      }
      if (subCategory.categorie_id) {
        await this.categoryModel.updateMany(
          { id: subCategory.categorie_id },
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

  /**
   * Find a subcategory by ID, throwing an error if not found.
   */
  async findOne(id: string) {
    const subCategory = await this.subCategoryModel.findById(id);
    if (!subCategory) throw new NotFoundException('Subcategory not found');
    return { message: 'Subcategory fetched successfully', data: subCategory };
  }
  
  async findBySlug(slug: string) {
    const subCategory = await this.subCategoryModel.findOne({ slug });
    if (!subCategory) throw new NotFoundException('Subcategory not found');
    return { message: 'Subcategory fetched successfully', data: subCategory };
  }
}

