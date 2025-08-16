import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewSchema } from '../../models/reviews.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}

  async findAll(publishedOnly = false): Promise<any[]> {
    const filter = publishedOnly ? { publier: '1' } : {};
    return this.reviewModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: 'id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          comment: 1,
          stars: 1,
          publier: 1,
          created_at: 1,
          user: {
            name: '$user.name',
            role: '$user.role_id',
            avatar: '$user.avatar'
          }
        }
      }
    ]).exec();
  }

  async findById(id: string): Promise<Review> {
    const review = await this.reviewModel.findOne({ id }).exec();
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async create(data: Partial<Review>): Promise<Review> {
    // Generate a new id if not provided or empty
    if (!data.id || data.id.trim() === '') {
      const last = await this.reviewModel.findOne().sort({ id: -1 }).exec();
      data.id = last ? (parseInt(last.id, 10) + 1).toString() : '1';
    }
    
    // Set timestamps
    const now = new Date().toISOString();
    data.created_at = now;
    data.updated_at = now;
    
    console.log('Creating review with data:', data);
    const created = new this.reviewModel(data);
    const saved = await created.save();
    console.log('Review saved to database:', saved);
    return saved;
  }

  async update(id: string, data: Partial<Review>): Promise<Review> {
    console.log('Updating review with id:', id, 'data:', data);
    
    // Set updated timestamp
    data.updated_at = new Date().toISOString();
    
    // Try to update by id field first, then by _id if not found
    let updated = await this.reviewModel.findOneAndUpdate({ id }, data, { new: true }).exec();
    
    if (!updated) {
      // Try updating by MongoDB _id
      updated = await this.reviewModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }
    
    if (!updated) {
      console.log('Review not found with id:', id);
      throw new NotFoundException('Review not found');
    }
    console.log('Review updated successfully:', updated);
    return updated;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    console.log('Deleting review with id:', id);
    
    // Try to delete by id field first, then by _id if not found
    let res = await this.reviewModel.deleteOne({ id }).exec();
    
    if (res.deletedCount === 0) {
      // Try deleting by MongoDB _id
      const deletedDoc = await this.reviewModel.findByIdAndDelete(id).exec();
      res = { deletedCount: deletedDoc ? 1 : 0 } as any;
    }
    
    console.log('Delete result:', res);
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

  // Fetch reviews with user info for testimonials
  async findAllWithUser(publishedOnly = false): Promise<any[]> {
    const filter = publishedOnly ? { publier: '1', comment: { $ne: null } } : { comment: { $ne: null } };
    console.log('Aggregation filter:', filter);
    const reviews = await this.reviewModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: 'id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          comment: 1,
          stars: 1,
          publier: 1,
          created_at: 1,
          user: {
            name: '$user.name',
            role: '$user.role_id',
            avatar: '$user.avatar'
          }
        }
      }
    ]).exec();
    console.log('Aggregated reviews:', reviews);
    return reviews || [];
  }
}