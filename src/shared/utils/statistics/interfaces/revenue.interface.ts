// src/shared/utils/statistics/interfaces/revenue.interface.ts
export interface RevenueOverTimeResult {
    date: Date;
    label: string;
    totalRevenue: number;
    orderCount: number;
  }
  
  export interface YearOverYearComparison {
    currentYear: {
      year: number;
      monthlyRevenue: number[];
      total: number;
    };
    previousYear: {
      year: number;
      monthlyRevenue: number[];
      total: number;
    };
    yearOverYearGrowth: number;
  }
  
  export interface CategoryPerformance {
    categoryId: string;
    categoryName: string;
    totalRevenue: number;
    totalSold: number;
    totalOrders: number;
    averageOrderValue: number;
    marketShare?: number;
  }
  
  export interface PromoCodeStats {
    promoCodeId: string;
    code: string;
    discountValue: number;
    totalUses: number;
    totalDiscount: number;
    totalRevenue: number;
    avgDiscountPerUse: number;
    firstUsed: Date;
    lastUsed: Date;
  }