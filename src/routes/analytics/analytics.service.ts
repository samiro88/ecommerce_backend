import {
    Injectable,
    Inject,
    forwardRef,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { Product } from '../../models/product.schema';
  import { Category } from '../../models/category.schema'; // ✅ Confirm this file exists
  import { PromoCode } from '../../models/promo-code.schema';
  import { Vente } from '../../models/vente.schema'; // Fixed name
  
  @Injectable()
  export class AnalyticsService {
    constructor(
      @InjectModel(Product.name) private productModel: Model<Product>,
      @InjectModel(Category.name) private categoryModel: Model<Category>,
      @InjectModel(PromoCode.name) private promoCodeModel: Model<PromoCode>,
      @InjectModel(Vente.name) private ventesModel: Model<Vente>,
    ) {}
  
    async getTopSellingProducts() {
      try {
        // Implement your original logic from controllers/analytics.js
        // Example:
        return await this.productModel
          .find()
          .sort({ salesCount: -1 })
          .limit(10)
          .exec();
      } catch (error) {
        throw new Error(error.message);
      }
    }
  
    async getTotalRevenueOverTime(query: any) {
      try {
        // Implement your date filtering logic based on query params
        const { startDate, endDate } = query;
        // Example implementation:
        const matchStage: any = {};
        if (startDate && endDate) {
          matchStage.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
        }
  
        return await this.ventesModel.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalAmount' },
              count: { $sum: 1 },
            },
          },
        ]);
      } catch (error) {
        throw new Error(error.message);
      }
    }
  
    async getYearOverYearComparison(query: any) {
      try {
        // Implement year-over-year comparison logic
        // Example:
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;
  
        const results = await Promise.all([
          this.ventesModel.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(`${currentYear}-01-01`),
                  $lte: new Date(`${currentYear}-12-31`),
                },
              },
            },
            {
              $group: {
                _id: null,
                currentYearRevenue: { $sum: '$totalAmount' },
              },
            },
          ]),
          this.ventesModel.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: new Date(`${lastYear}-01-01`),
                  $lte: new Date(`${lastYear}-12-31`),
                },
              },
            },
            {
              $group: {
                _id: null,
                lastYearRevenue: { $sum: '$totalAmount' },
              },
            },
          ]),
        ]);
  
        return {
          currentYear: results[0][0]?.currentYearRevenue || 0,
          lastYear: results[1][0]?.lastYearRevenue || 0,
          growthPercentage: results[0][0]?.currentYearRevenue
            ? ((results[0][0].currentYearRevenue - (results[1][0]?.lastYearRevenue || 0)) /
                (results[1][0]?.lastYearRevenue || 1)) *
              100
            : 0,
        };
      } catch (error) {
        throw new Error(error.message);
      }
    }
  
    async getCategoryPerformance() {
      try {
        // Implement category performance logic
        // Example:
        return await this.categoryModel.aggregate([
          {
            $lookup: {
              from: 'products',
              localField: '_id',
              foreignField: 'category',
              as: 'products',
            },
          },
          {
            $project: {
              name: 1,
              productCount: { $size: '$products' },
              totalSales: { $sum: '$products.salesCount' },
            },
          },
          { $sort: { totalSales: -1 } },
        ]);
      } catch (error) {
        throw new Error(error.message);
      }
    }
  
    async getPromoCodeUsage() {
      try {
        // Implement promo code usage logic
        // Example:
        return await this.promoCodeModel.aggregate([
          {
            $lookup: {
              from: 'ventes',
              localField: 'code',
              foreignField: 'promoCode',
              as: 'usage',
            },
          },
          {
            $project: {
              code: 1,
              discountValue: 1,
              usageCount: { $size: '$usage' },
              totalDiscount: { $sum: '$usage.discountAmount' },
            },
          },
          { $sort: { usageCount: -1 } },
        ]);
      } catch (error) {
        throw new Error(error.message);
      }
    }
  }