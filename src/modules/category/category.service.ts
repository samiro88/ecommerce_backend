import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../../models/category.schema';
import { CloudinaryService } from '../../controllers/cloudinary/cloudinary.service'; // ✅ FIXED IMPORT

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private cloudinaryService: CloudinaryService, // ✅ Dependency Injection
  ) {}

  async getAllCategories() {
    return this.categoryModel.find()
  .sort('-createdAt')
  .populate('subCategories', '_id designation designation_fr name slug')
  .exec();
  }

  async createCategory(file: Express.Multer.File, categoryData: any) {
    try {
      // Accept all fields with defaults
      const categoryPayload = {
        designation: categoryData.designation || categoryData.designation_fr || `category-${Date.now()}`,
        designation_fr: categoryData.designation_fr || categoryData.designation || '',
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
        created_by: '',
        updated_by: '',
      };

      let imageData: { url: string; img_id: string } | null = null;
      if (file) {
        try {
          const result = await this.cloudinaryService.uploadImage(file);
          imageData = { url: result.secure_url, img_id: result.public_id };
        } catch (error) {
          console.error('Image upload error:', error);
        }
      }

      const newCategory = new this.categoryModel({
        ...categoryPayload,
        image: imageData,
      });

      return await newCategory.save();
    } catch (error) {
      console.error('Category creation error:', error);
      throw error;
    }
  }

  async deleteCategory(id: string) {
    const category = await this.categoryModel.findById(id).populate('subCategories');
    if (!category) throw new NotFoundException('Category not found');

    if (category.image?.img_id) {
      try {
        await this.cloudinaryService.deleteImage(category.image.img_id);
      } catch (e) {
        // Ignore cloudinary delete errors
      }
    }
    await this.categoryModel.findByIdAndDelete(id);

    return { message: 'Category deleted successfully' };
  }

  async updateCategory(id: string, file: Express.Multer.File, categoryData: any) {
    try {
      const category = await this.categoryModel.findById(id);
      if (!category) throw new NotFoundException('Category not found');

      // Update all fields safely
      const allowedFields = [
        'designation', 'designation_fr', 'cover', 'cover_liste_produits', 'product_liste_cover',
        'description_fr', 'alt_cover', 'description_cover', 'meta',
        'content_seo', 'review', 'aggregateRating', 'nutrition_values',
        'questions', 'more_details', 'zone1', 'zone2', 'zone3', 'schema_description'
      ];
      
      allowedFields.forEach(key => {
        if (categoryData[key] !== undefined) {
          category[key] = categoryData[key] || '';
        }
      });
      
      category.updated_by = '';

      let newImage = category.image;
      if (file) {
        if (category.image?.img_id) {
          try {
            await this.cloudinaryService.deleteImage(category.image.img_id);
          } catch (e) {
            // Ignore cloudinary delete errors
          }
        }
        const result = await this.cloudinaryService.uploadImage(file);
        newImage = { url: result.secure_url, img_id: result.public_id };
        category.image = newImage;
      }
      
      return await category.save();
    } catch (error) {
      console.error('Category update error:', error);
      throw error;
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
