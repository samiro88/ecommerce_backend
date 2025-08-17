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
    const promotions = await this.topPromotionModel.find()
      .sort('-createdAt')
      .exec();

    // Manual population to get product data with images
    const mapped = await Promise.all(promotions.map(async (promo: any) => {
      const promoObj = promo.toObject();
      let product: any = null;
      
      if (promoObj.productId) {
        try {
          let productId = promoObj.productId;
          // Handle ObjectId conversion
          if (typeof productId === 'object') {
            productId = productId.toString();
          }
          
          const productDoc = await this.topPromotionModel.db.collection('products').findOne({ _id: new (require('mongoose').Types.ObjectId)(productId) });
          
          if (productDoc) {
            product = {
              _id: productDoc._id,
              designation: productDoc.designation_fr || productDoc.designation,
              price: productDoc.prix || productDoc.price,
              oldPrice: productDoc.promo || productDoc.oldPrice,
              mainImage: productDoc.mainImage || { url: productDoc.cover || '', img_id: '' },
              images: productDoc.images || [],
              cover: productDoc.cover || productDoc.mainImage?.url || ''
            };
          }
        } catch (error: any) {
          console.log('Error fetching product:', promoObj.productId, error.message);
        }
      }
      
      return {
        ...promoObj,
        product
      };
    }));

    return { message: 'Success', data: mapped };
  }

  async getActiveTopPromotions() {
    console.log('=== getActiveTopPromotions called ===');
    const now = new Date();
    const promotions = await this.topPromotionModel.find({
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort('-createdAt')
      .exec();
    
    console.log('Found promotions:', promotions.length);

    // Manual population since populate isn't working
    const mapped = await Promise.all(promotions.map(async (promo: any) => {
      const promoObj = promo.toObject();
      let product: any = null;
      
      console.log('ProductId type:', typeof promoObj.productId, 'Value:', promoObj.productId);
      
      if (promoObj.productId) {
        try {
          let productId = promoObj.productId;
          // Handle ObjectId conversion
          if (typeof productId === 'object') {
            productId = productId.toString();
          }
          
          console.log('Searching for product with ID:', productId);
          const productDoc = await this.topPromotionModel.db.collection('products').findOne({ _id: new (require('mongoose').Types.ObjectId)(productId) });
          console.log('Product found:', !!productDoc);
          
          if (productDoc) {
            product = {
              _id: productDoc._id,
              designation: productDoc.designation_fr || productDoc.designation,
              price: productDoc.prix || productDoc.price,
              oldPrice: productDoc.promo || productDoc.oldPrice,
              mainImage: productDoc.mainImage || { url: productDoc.cover || '', img_id: '' },
              images: productDoc.images || [],
              cover: productDoc.cover || productDoc.mainImage?.url || ''
            };
          }
        } catch (error: any) {
          console.log('Error fetching product:', promoObj.productId, error.message);
        }
      }
      
      return {
        ...promoObj,
        product
      };
    }));

    return { message: 'Success', data: mapped };
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