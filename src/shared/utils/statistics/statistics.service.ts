import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Schema } from 'mongoose';
import { Vente } from '../../../models/vente.schema';
import {
  RevenueOverTimeResult,
  YearOverYearComparison,
  CategoryPerformance,
  PromoCodeStats
} from './interfaces/revenue.interface';

@Injectable()
export class StatisticsService {
  private dashboardAnalyticsModel: Model<any>;
  constructor(
    @InjectModel(Vente.name) private readonly venteModel: Model<Vente>,
    @Inject('DATABASE_CONNECTION') private readonly connection: Connection,
  ) {
    if (this.connection.models['dashboard_analytics']) {
      this.dashboardAnalyticsModel = this.connection.models['dashboard_analytics'];
    } else {
      this.dashboardAnalyticsModel = this.connection.model(
        'dashboard_analytics',
        new Schema({}, { strict: false, collection: 'dashboard_analytics' })
      );
    }
  }

  async getTotalRevenueOverTime(
    timeFrame = 'monthly',
    startDate: Date | null = null,
    endDate: Date | null = null
  ): Promise<RevenueOverTimeResult[]> {
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc || !Array.isArray((doc as any).ventes)) return [];
    const ventes: any[] = (doc as any).ventes;
    const end = endDate || new Date();
    const start = startDate || new Date(new Date().setFullYear(end.getFullYear() - 1));
    const groupMap: Record<string, { totalRevenue: number, count: number, label: string }> = {};
    
    ventes.forEach((vente: any) => {
      const date = vente.createdAt ? new Date(vente.createdAt) : null;
      if (!date || date < start || date > end) return;
      let key = '';
      let label = '';
      switch (timeFrame) {
        case 'daily':
          key = date.toISOString().slice(0, 10);
          label = date.toLocaleDateString();
          break;
        case 'weekly': {
          const year = date.getFullYear();
          const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7);
          key = `${year}-W${week}`;
          label = `Week ${week}, ${year}`;
          break;
        }
        case 'monthly':
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
          break;
        case 'quarterly':
          key = `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`;
          label = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
          break;
        case 'yearly':
          key = `${date.getFullYear()}`;
          label = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().slice(0, 10);
          label = date.toLocaleDateString();
      }
      if (!groupMap[key]) groupMap[key] = { totalRevenue: 0, count: 0, label };
      groupMap[key].totalRevenue += vente.netAPayer || 0;
      groupMap[key].count += 1;
    });
    
    return Object.entries(groupMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => ({
        date: new Date(key.match(/^\d{4}-\d{1,2}-\d{1,2}$/) ? key : key.split('-')[0]), // Try to parse as date, fallback to year
        label: val.label,
        totalRevenue: val.totalRevenue,
        orderCount: val.count
      }));
  }

  async getYearOverYearComparison(): Promise<YearOverYearComparison> {
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc || !Array.isArray((doc as any).ventes)) return {
      currentYear: { year: new Date().getFullYear(), monthlyRevenue: Array(12).fill(0), total: 0 },
      previousYear: { year: new Date().getFullYear() - 1, monthlyRevenue: Array(12).fill(0), total: 0 },
      yearOverYearGrowth: 0
    };
    
    const ventes: any[] = (doc as any).ventes;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const lastYear = currentYear - 1;

    const currentYearData = Array(12).fill(0);
    const previousYearData = Array(12).fill(0);

    ventes.forEach((vente: any) => {
      const date = vente.createdAt ? new Date(vente.createdAt) : null;
      if (!date) return;
      
      const year = date.getFullYear();
      const month = date.getMonth();
      const revenue = vente.netAPayer || 0;

      if (year === currentYear) {
        currentYearData[month] += revenue;
      } else if (year === lastYear) {
        previousYearData[month] += revenue;
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
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc || !Array.isArray((doc as any).ventes) || !Array.isArray((doc as any).categories)) return [];
    
    const ventes: any[] = (doc as any).ventes;
    const categories: any[] = (doc as any).categories;
    const end = endDate || new Date();
    const start = startDate || new Date(new Date().setFullYear(end.getFullYear() - 1));

    const categoryMap: Record<string, {
      categoryId: string;
      categoryName: string;
      totalRevenue: number;
      totalSold: number;
      totalOrders: number;
      orderIds: Set<string>;
    }> = {};

    // Initialize category map
    categories.forEach((category: any) => {
    categoryMap[category._id.toString()] = {
    categoryId: category._id.toString(),
    categoryName: category.designation,
    totalRevenue: 0,
    totalSold: 0,
    totalOrders: 0,
    orderIds: new Set()
    };
    });
    
    // Process each vente
    ventes.forEach((vente: any) => {
    const date = vente.createdAt ? new Date(vente.createdAt) : null;
    if (!date || date < start || date > end) return;
    
    vente.items?.forEach((item: any) => {
    if (!item.categoryId) return;
    const category = categoryMap[item.categoryId.toString()];
    if (!category) return;
    category.totalRevenue += item.price || 0;
    category.totalSold += item.quantity || 0;
    category.orderIds.add(vente._id);
    });
    });

    // Calculate totals
    const totalRevenueAllCategories = Object.values(categoryMap)
      .reduce((sum, category) => sum + category.totalRevenue, 0);

    // Format results
    const result = Object.values(categoryMap)
    .map(category => ({
    categoryId: category.categoryId,
    categoryName: category.categoryName,
    totalRevenue: category.totalRevenue,
    totalSold: category.totalSold,
    totalOrders: category.orderIds.size,
    averageOrderValue: category.orderIds.size > 0 
    ? category.totalRevenue / category.orderIds.size 
    : 0,
    marketShare: totalRevenueAllCategories > 0
    ? category.totalRevenue / totalRevenueAllCategories
    : 0
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
    console.log("CATEGORY PERFORMANCE RESULT:", result);
    return result;
    }

  async getPromoCodeUsageStats(
    startDate: Date | null = null,
    endDate: Date | null = null
  ): Promise<PromoCodeStats[]> {
    const doc = await this.dashboardAnalyticsModel.findOne() as any;
    if (!doc || !Array.isArray((doc as any).ventes) || !Array.isArray((doc as any).promoCodes)) return [];
    
    const ventes: any[] = (doc as any).ventes;
    const promoCodes: any[] = (doc as any).promoCodes;
    const end = endDate || new Date();
    const start = startDate || new Date(new Date().setFullYear(end.getFullYear() - 1));

    const promoCodeMap: Record<string, {
      promoCodeId: string;
      code: string;
      discountValue: number;
      totalUses: number;
      totalDiscount: number;
      totalRevenue: number;
      firstUsed: Date | null;
      lastUsed: Date | null;
    }> = {};

    // Initialize promo code map
    promoCodes.forEach((promo: any) => {
      promoCodeMap[promo._id] = {
        promoCodeId: promo._id,
        code: promo.code,
        discountValue: promo.discount,
        totalUses: 0,
        totalDiscount: 0,
        totalRevenue: 0,
        firstUsed: null,
        lastUsed: null
      };
    });

    // Process each vente
    ventes.forEach((vente: any) => {
      const date = vente.createdAt ? new Date(vente.createdAt) : null;
      if (!date || date < start || date > end || !vente.promoCode?.id) return;

      const promoStats = promoCodeMap[vente.promoCode.id];
      if (!promoStats) return;

      promoStats.totalUses += 1;
      promoStats.totalDiscount += vente.discount || 0;
      promoStats.totalRevenue += vente.netAPayer || 0;

      if (!promoStats.firstUsed || date < promoStats.firstUsed) {
        promoStats.firstUsed = date;
      }
      if (!promoStats.lastUsed || date > promoStats.lastUsed) {
        promoStats.lastUsed = date;
      }
    });

    // Format results
    return Object.values(promoCodeMap)
      .map(promo => ({
        promoCodeId: promo.promoCodeId,
        code: promo.code,
        discountValue: promo.discountValue,
        totalUses: promo.totalUses,
        totalDiscount: promo.totalDiscount,
        totalRevenue: promo.totalRevenue,
        avgDiscountPerUse: promo.totalUses > 0
          ? promo.totalDiscount / promo.totalUses
          : 0,
        firstUsed: promo.firstUsed ? promo.firstUsed : new Date(0),
        lastUsed: promo.lastUsed ? promo.lastUsed : new Date(0)
      }))
      .sort((a, b) => b.totalUses - a.totalUses);
  }
}