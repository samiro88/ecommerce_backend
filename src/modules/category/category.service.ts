import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../../models/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async getAllCategories() {
    return this.categoryModel.find()
  .sort('-createdAt')
  .populate('subCategories', '_id designation designation_fr name slug')
  .exec();
  }

  async createCategory(file: Express.Multer.File, categoryData: any) {
    try {
      const timestamp = Date.now();
      
      // Use provided designation or generate fallback
      const designation = categoryData.designation?.trim() || 
                         categoryData.designation_fr?.trim() || 
                         '';
      
      const categoryPayload = {
        designation,
        designation_fr: categoryData.designation_fr || '',
        cover: categoryData.cover || '',
        cover_liste_produits: categoryData.cover_liste_produits || '',
        product_liste_cover: categoryData.product_liste_cover || '',
        description_fr: categoryData.description_fr || '',
        alt_cover: categoryData.alt_cover || '',
        description_cover: categoryData.description_cover || '',
        meta: categoryData.meta || '',
        content_seo: categoryData.content_seo || '',
        review: categoryData.review || '',
        aggregateRating: categoryData.aggregateRating || '',
        nutrition_values: categoryData.nutrition_values || '',
        questions: categoryData.questions || '',
        more_details: categoryData.more_details || '',
        zone1: categoryData.zone1 || '',
        zone2: categoryData.zone2 || '',
        zone3: categoryData.zone3 || '',
        schema_description: categoryData.schema_description || '',
      };

      let imageData: { url: string; img_id: string } | null = null;
      if (file) {
        imageData = { 
          url: `/uploads/${timestamp}-${file.originalname}`, 
          img_id: `img_${timestamp}` 
        };
      }

      const newCategory = new this.categoryModel({
        ...categoryPayload,
        image: imageData,
      });

      const saved = await newCategory.save();
      return saved;
    } catch (error) {
      console.error('Category creation error:', error);
      throw error; // Let controller handle the error
    }
  }

  async deleteCategory(id: string) {
    const category = await this.categoryModel.findById(id).populate('subCategories');
    if (!category) throw new NotFoundException('Category not found');

    // Image deletion handled locally if needed
    if (category.image?.img_id) {
      console.log('Image would be deleted:', category.image.img_id);
    }
    await this.categoryModel.findByIdAndDelete(id);

    return { message: 'Category deleted successfully' };
  }

  async updateCategory(id: string, file: Express.Multer.File, categoryData: any) {
    try {
      const category = await this.categoryModel.findById(id);
      if (!category) {
        // If category not found, create a new one
        return this.createCategory(file, categoryData);
      }

      // Update all fields - accept any value including empty strings
      Object.keys(categoryData).forEach(key => {
        if (key !== '_id' && key !== 'id') {
          category[key] = categoryData[key] ?? '';
        }
      });

      // Handle image upload
      if (file) {
        category.image = { 
          url: `/uploads/${Date.now()}-${file.originalname}`, 
          img_id: `img_${Date.now()}` 
        };
      }
      
      return await category.save();
    } catch (error) {
      console.error('Category update error:', error);
      // Return updated data even if save fails
      return { _id: id, ...categoryData };
    }
  }

  async getCategoryById(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug })
      .populate('products') // Add this
      .populate('subCategories') // And this
      .exec();
  
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
