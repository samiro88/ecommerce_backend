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

  async createCategory(file: Express.Multer.File, designation: string) {
    if (!file) throw new BadRequestException('No file uploaded');

    const result = await this.cloudinaryService.uploadImage(file); // ✅ FIXED METHOD NAME

    const newCategory = new this.categoryModel({
      designation,
      image: { url: result.secure_url, img_id: result.public_id },
    });

    return newCategory.save();
  }

  async deleteCategory(id: string) {
    const category = await this.categoryModel.findById(id).populate('subCategories');
    if (!category) throw new NotFoundException('Category not found');

    await this.cloudinaryService.deleteImage(category.image.img_id); // ✅ FIXED METHOD NAME
    await this.categoryModel.findByIdAndDelete(id);

    return { message: 'Category deleted successfully' };
  }

  async updateCategory(id: string, file: Express.Multer.File, designation?: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    let newImage = category.image;
    if (file) {
      await this.cloudinaryService.deleteImage(category.image.img_id); // ✅ FIXED METHOD NAME
      const result = await this.cloudinaryService.uploadImage(file); // ✅ FIXED METHOD NAME
      newImage = { url: result.secure_url, img_id: result.public_id };
    }

    category.designation = designation || category.designation;
    category.image = newImage;
    return category.save();
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
