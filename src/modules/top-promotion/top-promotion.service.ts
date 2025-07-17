import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { TopPromotion } from '../../models/top-promotion.schema';

@Injectable()
export class TopPromotionService {
  constructor(
    @InjectModel(TopPromotion.name) private topPromotionModel: Model<TopPromotion>,
  ) {}

  async getAllTopPromotions() {
    const promotions = await this.topPromotionModel.find().sort('-createdAt').exec();
    return { message: 'Success', data: promotions };
  }

  async getActiveTopPromotions() {
    const now = new Date();
    const promotions = await this.topPromotionModel.find({
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort('-createdAt').exec();
    return { message: 'Success', data: promotions };
  }

  async getTopPromotionById(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid promotion ID');
    }
    const promo = await this.topPromotionModel.findById(id).exec();
    if (!promo) {
      throw new NotFoundException('Top promotion not found');
    }
    return { message: 'Success', data: promo };
  }

  async createTopPromotion(dto: any) {
    // Optionally: validate dto fields here
    const created = await this.topPromotionModel.create(dto);
    return { message: 'Created', data: created };
  }

  async updateTopPromotion(id: string, dto: any) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid promotion ID');
    }
    const updated = await this.topPromotionModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Top promotion not found');
    }
    return { message: 'Updated', data: updated };
  }

  async deleteTopPromotion(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid promotion ID');
    }
    const deleted = await this.topPromotionModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Top promotion not found');
    }
    return { message: 'Deleted', data: deleted };
  }
}