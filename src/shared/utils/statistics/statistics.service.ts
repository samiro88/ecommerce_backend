// src/shared/utils/statistics/statistics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vente, VenteSchema } from '../../../models/vente.schema';
import {
  RevenueOverTimeResult,
  YearOverYearComparison,
  CategoryPerformance,
  PromoCodeStats
} from './interfaces/revenue.interface';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Vente.name) private readonly venteModel: Model<Vente>
  ) {}

  async getTotalRevenueOverTime(
    timeFrame = 'monthly',
    startDate:Date | null = null,
    endDate: Date | null = null
  ): Promise<RevenueOverTimeResult[]> {
    const end = endDate || new Date();
    const start = startDate || new Date(new Date().setFullYear(end.getFullYear() - 1));

    let dateGrouping = {};
    switch (timeFrame) {
      case 'daily':
        dateGrouping = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        };
        break;
      case 'weekly':
        dateGrouping = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" }
        };
        break;
      case 'monthly':
        dateGrouping = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        };
        break;
      case 'quarterly':
        dateGrouping = {
          year: { $year: "$createdAt" },
          quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } }
        };
        break;
      case 'yearly':
        dateGrouping = { year: { $year: "$createdAt" } };
        break;
    }

    const revenueData = await this.venteModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $nin: ["cancelled", "refunded"] }
        }
      },
      {
        $group: {
          _id: dateGrouping,
          totalRevenue: { $sum: "$netAPayer" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          timePeriod: "$_id",
          totalRevenue: 1,
          count: 1
        }
      },
      {
        $sort: {
          "timePeriod.year": 1,
          "timePeriod.month": 1,
          "timePeriod.day": 1,
          "timePeriod.week": 1,
          "timePeriod.quarter": 1
        }
      }
    ]);

    return revenueData.map((item) => {
      let date, label;
      const { year } = item.timePeriod;
      
      switch (timeFrame) {
        case 'daily':
          date = new Date(year, item.timePeriod.month - 1, item.timePeriod.day);
          label = date.toLocaleDateString();
          break;
        case 'weekly':
          date = new Date(year, 0, 1);
          date.setDate(date.getDate() + (item.timePeriod.week - 1) * 7);
          label = `Week ${item.timePeriod.week}, ${year}`;
          break;
        case 'monthly':
          date = new Date(year, item.timePeriod.month - 1);
          label = date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
          break;
        case 'quarterly':
          date = new Date(year, (item.timePeriod.quarter - 1) * 3);
          label = `Q${item.timePeriod.quarter} ${year}`;
          break;
        case 'yearly':
          date = new Date(year, 0);
          label = year.toString();
          break;
      }

      return { 
        date, 
        label, 
        totalRevenue: item.totalRevenue, 
        orderCount: item.count 
      };
    });
  }

  async getYearOverYearComparison(): Promise<YearOverYearComparison> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const lastYear = currentYear - 1;

    const yearlyData = await this.venteModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${lastYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          },
          status: { $nin: ["cancelled", "refunded"] }
        }
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalRevenue: { $sum: "$netAPayer" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const currentYearData = Array(12).fill(0);
    const previousYearData = Array(12).fill(0);

    yearlyData.forEach((item) => {
      if (item._id.year === currentYear) {
        currentYearData[item._id.month - 1] = item.totalRevenue;
      } else if (item._id.year === lastYear) {
        previousYearData[item._id.month - 1] = item.totalRevenue;
      }
    });

    const currentYearTotal = currentYearData.reduce((a, b) => a + b, 0);
    const previousYearTotal = previousYearData.reduce((a, b) => a + b, 0);
    const yearlyGrowth = previousYearTotal > 0
      ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100
      : 0;

    return {
      currentYear: { 
        year: currentYear, 
        monthlyRevenue: currentYearData, 
        total: currentYearTotal 
      },
      previousYear: { 
        year: lastYear, 
        monthlyRevenue: previousYearData, 
        total: previousYearTotal 
      },
      yearOverYearGrowth: yearlyGrowth
    };
  }

  async getCategoryPerformance(
    startDate: Date | null = null,
    endDate: Date | null = null
  ): Promise<CategoryPerformance[]> {
    const matchStage = {
      createdAt: {
        $gte: startDate || new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        $lte: endDate || new Date()
      },
      status: { $nin: ["cancelled", "refunded"] },
      "items.type": "Product"
    };

    return this.venteModel.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      { $match: { "items.type": "Product" } },
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
          _id: "$category._id",
          categoryName: { $first: "$category.designation" },
          totalRevenue: { $sum: "$items.price" },
          totalSold: { $sum: "$items.quantity" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$items.price" }
        }
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          categoryName: 1,
          totalRevenue: 1,
          totalSold: 1,
          totalOrders: 1,
          averageOrderValue: 1,
          marketShare: { 
            $divide: ["$totalRevenue", { $sum: "$totalRevenue" }] 
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
  }

  async getPromoCodeUsageStats(
    startDate: Date | null = null,
    endDate: Date | null = null
  ): Promise<PromoCodeStats[]> {
    const matchStage = {
      "promoCode.id": { $exists: true, $ne: null },
      createdAt: {
        $gte: startDate || new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        $lte: endDate || new Date()
      }
    };

    return this.venteModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "promocodes",
          localField: "promoCode.id",
          foreignField: "_id",
          as: "promoCodeDetails"
        }
      },
      { $unwind: "$promoCodeDetails" },
      {
        $group: {
          _id: "$promoCodeDetails._id",
          code: { $first: "$promoCodeDetails.code" },
          discountValue: { $first: "$promoCodeDetails.discount" },
          totalUses: { $sum: 1 },
          totalDiscount: { $sum: "$discount" },
          totalRevenue: { $sum: "$netAPayer" },
          firstUsed: { $min: "$createdAt" },
          lastUsed: { $max: "$createdAt" }
        }
      },
      {
        $project: {
          _id: 0,
          promoCodeId: "$_id",
          code: 1,
          discountValue: 1,
          totalUses: 1,
          totalDiscount: 1,
          totalRevenue: 1,
          avgDiscountPerUse: {
            $cond: [
              { $eq: ["$totalUses", 0] },
              0,
              { $divide: ["$totalDiscount", "$totalUses"] }
            ]
          },
          firstUsed: 1,
          lastUsed: 1
        }
      },
      { $sort: { totalUses: -1 } }
    ]);
  }
}