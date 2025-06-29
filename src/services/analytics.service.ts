import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Schema } from 'mongoose';
import { Invoice } from '../models/invoice.schema';
import { Product } from '../models/product.schema';
import { Category } from '../models/category.schema';
import { PromoCode } from '../models/promo-code.schema';
import { Vente } from '../models/vente.schema';

// For dashboard_analytics collection
import { Connection } from 'mongoose';


@Injectable()
export class AnalyticsService {
  private dashboardAnalyticsModel: Model<any>;
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<Invoice>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(PromoCode.name) private readonly promoCodeModel: Model<PromoCode>,
    @InjectModel(Vente.name) private readonly ventesModel: Model<Vente>,
    @Inject('DATABASE_CONNECTION') private readonly connection: Connection,
  ) {
    // Lazy model registration for dashboard_analytics
    if (this.connection.models['dashboard_analytics']) {
      this.dashboardAnalyticsModel = this.connection.models['dashboard_analytics'];
    } else {
      this.dashboardAnalyticsModel = this.connection.model(
        'dashboard_analytics',
        new Schema({}, { strict: false, collection: 'dashboard_analytics' })
      );
    }
  }

  // --- Methods from dashboard_analytics ---
  async getMostSoldProduct() {
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc || !Array.isArray((doc as any).ventes)) return null;
    const ventes: any[] = (doc as any).ventes;
    const productSales = {};
    ventes.forEach((vente: any) => {
      (vente.items || []).forEach((item: any) => {
        if (!item.productName) return;
        productSales[item.productName] = (productSales[item.productName] || 0) + (item.quantity || 0);
      });
    });
    const sorted = (Object.entries(productSales) as [string, number][]).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return null;
    return { product: sorted[0][0], totalSold: sorted[0][1] };
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
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc || !Array.isArray((doc as any).ventes)) return [];
    const ventes: any[] = (doc as any).ventes;
    const productSales = {};
    ventes.forEach((vente: any) => {
      (vente.items || []).forEach((item: any) => {
        if (!item.productName) return;
        productSales[item.productName] = (productSales[item.productName] || 0) + (item.quantity || 0);
      });
    });
    const sorted = (Object.entries(productSales) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return sorted.map(([product, totalSold]) => ({ product, totalSold }));
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
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc || !Array.isArray((doc as any).ventes)) return [];
    const ventes: any[] = (doc as any).ventes;
    const { startDate, endDate } = query;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const filtered = ventes.filter((vente: any) => {
      const date = vente.createdAt ? new Date(vente.createdAt) : null;
      if (!date) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
    const totalRevenue = filtered.reduce((sum: number, v: any) => sum + (v.netAPayer || 0), 0);
    return [{ totalRevenue, count: filtered.length }];
  }

  async getYearOverYearComparison(query: any) {
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc || !Array.isArray((doc as any).ventes)) return { currentYear: 0, lastYear: 0, growthPercentage: 0 };
    const ventes: any[] = (doc as any).ventes;
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;
    let currentYearRevenue = 0;
    let lastYearRevenue = 0;
    ventes.forEach((vente: any) => {
      const date = vente.createdAt ? new Date(vente.createdAt) : null;
      if (!date) return;
      if (date.getFullYear() === currentYear) currentYearRevenue += vente.netAPayer || 0;
      if (date.getFullYear() === lastYear) lastYearRevenue += vente.netAPayer || 0;
    });
    const growthPercentage = lastYearRevenue > 0 ? ((currentYearRevenue - lastYearRevenue) / lastYearRevenue) * 100 : 0;
    return {
      currentYear: currentYearRevenue,
      lastYear: lastYearRevenue,
      growthPercentage: parseFloat(growthPercentage.toFixed(2))
    };
  }

  async getCategoryPerformance() {
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc || !Array.isArray((doc as any).ventes) || !Array.isArray((doc as any).categories)) return [];
    const ventes: any[] = (doc as any).ventes;
    const categories: any[] = (doc as any).categories;
    // Map categoryId to designation
    const categoryMap = {};
    categories.forEach((cat: any) => {
      categoryMap[cat._id?.toString()] = cat.designation;
    });
    // Aggregate sales by category
    const categorySales: Record<string, number> = {};
    ventes.forEach((vente: any) => {
      (vente.items || []).forEach((item: any) => {
        if (!item.productName || !item.category) return;
        const cat = item.category;
        categorySales[cat] = (categorySales[cat] || 0) + (item.quantity || 0);
      });
    });
    return Object.entries(categorySales).map(([cat, totalSales]) => ({
      name: categoryMap[cat] || cat,
      totalSales
    }));
  }

  async getPromoCodeUsage() {
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc || !Array.isArray((doc as any).ventes)) return [];
    const ventes: any[] = (doc as any).ventes;
    // Aggregate promo code usage
    const promoStats: Record<string, { usageCount: number, totalDiscount: number }> = {};
    ventes.forEach((vente: any) => {
      if (vente.promoCode) {
        const code = vente.promoCode;
        promoStats[code] = promoStats[code] || { usageCount: 0, totalDiscount: 0 };
        promoStats[code].usageCount += 1;
        promoStats[code].totalDiscount += vente.discount || 0;
      }
    });
    return Object.entries(promoStats).map(([code, stats]) => ({
      code,
      usageCount: stats.usageCount,
      totalDiscount: stats.totalDiscount
    }));
  }

  async getDailySales(days: number): Promise<any> {
    const doc = await this.dashboardAnalyticsModel.findOne();
    if (!doc || !Array.isArray((doc as any).ventes)) return [];
    const ventes: any[] = (doc as any).ventes;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const dailyMap: Record<string, number> = {};
    ventes.forEach((vente: any) => {
      const date = vente.createdAt ? new Date(vente.createdAt) : null;
      if (!date || date < cutoff) return;
      const key = date.toISOString().slice(0, 10);
      dailyMap[key] = (dailyMap[key] || 0) + (vente.netAPayer || 0);
    });
    return Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, sales]) => ({ date, sales }));
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
    const doc = await this.dashboardAnalyticsModel.findOne();
    if (!doc || !Array.isArray((doc as any).ventes)) return [];
    const ventes: any[] = (doc as any).ventes;
    const countryMap: Record<string, { sales: number, orders: number }> = {};
    ventes.forEach((vente: any) => {
      const country = vente.client?.country || "Unknown";
      countryMap[country] = countryMap[country] || { sales: 0, orders: 0 };
      countryMap[country].sales += vente.netAPayer || 0;
      countryMap[country].orders += 1;
    });
    return Object.entries(countryMap).map(([country, stats]) => ({
      country,
      sales: stats.sales,
      orders: stats.orders
    })).sort((a, b) => b.sales - a.sales);
  }
}