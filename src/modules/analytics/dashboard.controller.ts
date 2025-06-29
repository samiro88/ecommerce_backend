import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics(@Query('range') range: string) {
    // Fetch metrics from the analytics document via the service
    const metrics = await this.dashboardService.getMetrics(range || '7d');
    // Optional: log for debugging
    // console.log('DASHBOARD METRICS:', metrics);
    return metrics;
  }

  @Get('activity')
  async getActivity(@Query('limit') limit: string) {
    // Fetch recent activity from the analytics document via the service
    return this.dashboardService.getRecentActivity(Number(limit) || 10);
  }
}