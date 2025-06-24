/*import {
    Controller,
    Get,
    Query,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { AnalyticsService } from './analytics.service';
  
  
  @Controller('analytics')
  export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}
  
    @Get('orders-by-category')
  async getOrdersByCategory() {
    return this.analyticsService.getOrdersByCategory();
  }
  
    @Get('top-products')
    async getTopSellingProducts() {
      try {
        return await this.analyticsService.getTopSellingProducts();
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('revenue')
    async getTotalRevenueOverTime(@Query() query: any) {
      try {
        return await this.analyticsService.getTotalRevenueOverTime(query);
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('revenue/year-comparison')
    async getYearOverYearComparison(@Query() query: any) {
      try {
        return await this.analyticsService.getYearOverYearComparison(query);
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('category-performance')
    async getCategoryPerformance() {
      try {
        return await this.analyticsService.getCategoryPerformance();
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('promo-code-performance')
    async getPromoCodeUsage() {
      try {
        return await this.analyticsService.getPromoCodeUsage();
      } catch (error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
    */