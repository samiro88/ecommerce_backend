import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice } from '../models/invoice.schema';
import { Product } from '../models/product.schema';
import { Category } from '../models/category.schema';
import { PromoCode } from '../models/promo-code.schema';
import { Vente } from '../models/vente.schema';


@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(PromoCode.name) private readonly promoCodeModel: Model<PromoCode>,
    @InjectModel(Vente.name) private readonly ventesModel: Model<Vente>,
  ) {}

  // --- Methods from Invoice-based analytics ---
  async getMostSoldProduct() {
    const result = await this.invoiceModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 1 },
    ]);
    return result[0];
  }

  async getBestDayForProduct(productId: string) {
    const result = await this.invoiceModel.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.product': new Types.ObjectId(productId) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 1 },
    ]);
    return result[0];
  }

  async getDayWithHighestRevenue() {
    const result = await this.invoiceModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalRevenue: { $sum: '$total' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 1 },
    ]);
    return result[0];
  }

  async getMonthlyRevenueByBrand(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return this.invoiceModel.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.brand",
          revenue: {
            $sum: {
              $add: [
                { $multiply: ["$items.price", "$items.quantity"] },
                {
                  $multiply: [
                    "$items.price",
                    "$items.quantity",
                    { $divide: ["$items.taxRate", 100] }
                  ]
                }
              ]
            }
          }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
  }

  async getTop5Products() {
    return this.invoiceModel.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }
    ]);
  }

  async getMonthlyRevenueComparison(year: number, month: number) {
    const currentStart = new Date(year, month - 1, 1);
    const currentEnd = new Date(year, month, 0, 23, 59, 59);
    const prevStart = new Date(year, month - 2, 1);
    const prevEnd = new Date(year, month - 1, 0, 23, 59, 59);

    const [current] = await this.invoiceModel.aggregate([
      { $match: { date: { $gte: currentStart, $lte: currentEnd } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const [previous] = await this.invoiceModel.aggregate([
      { $match: { date: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const currVal = current?.total || 0;
    const prevVal = previous?.total || 0;
    const change = prevVal > 0 ? ((currVal - prevVal) / prevVal) * 100 : 0;

    return {
      currentMonth: currVal,
      previousMonth: prevVal,
      percentChange: parseFloat(change.toFixed(2))
    };
  }

  async getAverageMarginPerBrand() {
    return this.invoiceModel.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.brand",
          totalRevenue: {
            $sum: {
              $multiply: ["$items.price", "$items.quantity"]
            }
          },
          totalCost: {
            $sum: {
              $multiply: ["$productDetails.costPrice", "$items.quantity"]
            }
          }
        }
      },
      {
        $project: {
          brand: "$_id",
          marginPercentage: {
            $cond: [
              { $gt: ["$totalRevenue", 0] },
              {
                $multiply: [
                  { $divide: [{ $subtract: ["$totalRevenue", "$totalCost"] }, "$totalRevenue"] },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { marginPercentage: -1 } }
    ]);
  }

  async filterSales({
    brand,
    category,
    type,
    clientType,
    paymentMode,
    from,
    to
  }: {
    brand?: string;
    category?: string;
    type?: string;
    clientType?: string;
    paymentMode?: string;
    from?: string;
    to?: string;
  }) {
    const match: any = {};
    if (type) match.type = type;
    if (clientType) match.clientType = clientType;
    if (paymentMode) match.paymentMode = paymentMode;
    if (from && to) match.date = { $gte: new Date(from), $lte: new Date(to) };

    const pipeline: any[] = [
      { $match: match },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }
    ];

    if (brand) {
      pipeline.push({ $match: { "productDetails.brand": brand } });
    }
    if (category) {
      pipeline.push({ $match: { "productDetails.category": new Types.ObjectId(category) } });
    }
    pipeline.push({
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
        totalSold: { $sum: "$items.quantity" }
      }
    });

    return this.invoiceModel.aggregate(pipeline);
  }

  // --- Methods from Vente-based analytics ---
  async getOrdersByCategory() {
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
    } catch (error) {
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
                format: '%Y-%m-%d',
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

  async getRecentActivity(limit: number = 10) {
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

  async getSalesByCountry() {
    return this.ventesModel.aggregate([
      {
        $group: {
          _id: "$client.country",
          sales: { $sum: "$netAPayer" },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          country: "$_id",
          sales: 1,
          orders: 1
        }
      },
      { $sort: { sales: -1 } }
    ]);
  }
}