import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewSchema } from '../../models/reviews.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}

  async findAll(publishedOnly = false): Promise<Review[]> {
    const filter = publishedOnly ? { publier: '1' } : {};
    return this.reviewModel.find(filter).sort({ created_at: -1 }).exec();
  }

  async findById(id: string): Promise<Review> {
    const review = await this.reviewModel.findOne({ id }).exec();
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async create(data: Partial<Review>): Promise<Review> {
    // Generate a new id if not provided
    if (!data.id) {
      const last = await this.reviewModel.findOne().sort({ id: -1 }).exec();
      data.id = last ? (parseInt(last.id, 10) + 1).toString() : '1';
    }
    const created = new this.reviewModel(data);
    return created.save();
  }

  async update(id: string, data: Partial<Review>): Promise<Review> {
    const updated = await this.reviewModel.findOneAndUpdate({ id }, data, { new: true }).exec();
    if (!updated) throw new NotFoundException('Review not found');
    return updated;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const res = await this.reviewModel.deleteOne({ id }).exec();
    return { deleted: res.deletedCount > 0 };
  }

  // Find all reviews for a specific product
  async findByProduct(product_id: string, publishedOnly = true): Promise<Review[]> {
    const filter: any = { product_id };
    if (publishedOnly) filter.publier = '1';
    return this.reviewModel.find(filter).sort({ created_at: -1 }).exec();
  }

  // Find all reviews by a specific user
  async findByUser(user_id: string): Promise<Review[]> {
    return this.reviewModel.find({ user_id }).sort({ created_at: -1 }).exec();
  }
}