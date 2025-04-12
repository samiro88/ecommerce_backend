import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

type Category = {
  id: number;
  name: string;
  description?: string;
  image?: string;
};

@Injectable()
export class CategoryService {
  private categories: Category[] = [];

  async createCategory(createDto: CreateCategoryDto, image: Express.Multer.File) {
    const newCategory = {
      id: Date.now(),
      ...createDto,
      image: image?.path
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  async deleteCategory(id: number) {
    this.categories = this.categories.filter(c => c.id !== id);
    return { deleted: true };
  }

  async updateCategory(id: number, updateDto: UpdateCategoryDto, image?: Express.Multer.File) {
    const category = this.categories.find(c => c.id === id);
    if (!category) throw new Error('Category not found');
    
    Object.assign(category, updateDto);
    if (image) category.image = image.path;
    
    return category;
  }

  async getAllCategories() {
    return this.categories;
  }

  async getCategoryById(id: number) {
    return this.categories.find(c => c.id === id);
  }
}
