/*
import {
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../models/product.schema';
import { Category } from '../../models/category.schema'; 
import { PromoCode } from '../../models/promo-code.schema';
import { Vente } from '../../models/vente.schema'; 

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(PromoCode.name) private promoCodeModel: Model<PromoCode>,
    @InjectModel(Vente.name) private ventesModel: Model<Vente>,
  ) {}


async getOrdersByCategory() {
    // Aggregate orders by category
    const agg = await this.ventesModel.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.itemId",
          foreignField: "_id",
          as: "product"
        }
        },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.designation",
          count: { $sum: "$items.quantity" }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1
        }
      }
       ]);
    // Return as { labels: [...], data: [...] }
    return {
      labels: agg.map((c) => c.category),
      data: agg.map((c) => c.count)
    };
  }












  async getTopSellingProducts() {
    try {

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
  
      const { startDate, endDate } = query;
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
    } catch (error)      {
      throw new Error(error.message);
    }
  }

  async getDailySales(days: number): Promise<any> {
    try {
      const salesData = await this.ventesModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000), 
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d', // Format the date to YYYY-MM-DD
                date: '$createdAt',
              },
            },
            sales: { $sum: '$totalAmount' }, 
          },
        },
        {
          $sort: {
            _id: 1, 
          },
        },
      ]);

      return salesData;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // --- Type-safe getRecentActivity (fixes TS errors) ---
  async getRecentActivity(limit: number = 10) {
    // Local interfaces for type assertions
    interface ProductLean {
      _id: any;
      designation: string;
      updatedBy?: any;
      updatedAt?: Date;
    }
    interface CategoryLean {
      _id: any;
      designation: string;
      updatedBy?: any;
      updatedAt?: Date;
    }
    interface VenteLean {
      _id: any;
      client?: { name?: string };
      createdAt?: Date;
    }

    const [recentProducts, recentCategories, recentVentes] = await Promise.all([
      this.productModel.find().sort({ updatedAt: -1 }).limit(limit).lean() as Promise<ProductLean[]>,
      this.categoryModel.find().sort({ updatedAt: -1 }).limit(limit).lean() as Promise<CategoryLean[]>,
      this.ventesModel.find().sort({ createdAt: -1 }).limit(limit).lean() as Promise<VenteLean[]>,
    ]);

    const activities = [
      ...recentProducts.map(p => ({
        type: "product",
        action: "updated",
        user: p.updatedBy ? p.updatedBy.toString() : "System",
        resource: p.designation,
        time: p.updatedAt,
        id: p._id,
      })),
      ...recentCategories.map(c => ({
        type: "category",
        action: "updated",
        user: c.updatedBy ? c.updatedBy.toString() : "System",
        resource: c.designation,
        time: c.updatedAt,
        id: c._id,
      })),
      ...recentVentes.map(v => ({
        type: "order",
        action: "created",
        user: v.client?.name || "Client",
        resource: `Order #${v._id}`,
        time: v.createdAt,
        id: v._id,
      })),
    ];

    activities.sort(
  (a, b) =>
    new Date(b.time ?? 0).getTime() - new Date(a.time ?? 0).getTime()
);
    return activities.slice(0, limit);
  }
}
  */
