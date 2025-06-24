import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

 // In dashboard.controller.ts
@Get('metrics')
async getMetrics(@Query('range') range: string) {
  const metrics = await this.dashboardService.getMetrics(range || '7d');
  console.log('DASHBOARD METRICS:', metrics); // Add this line
  return metrics;
}

  @Get('activity')
  async getActivity(@Query('limit') limit: string) {
    return this.dashboardService.getRecentActivity(Number(limit) || 10);
  }
}