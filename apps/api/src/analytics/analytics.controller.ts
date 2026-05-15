import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  async getKpis(@CurrentUser('companyId') companyId: string) {
    return this.analyticsService.getExecutiveKpis(companyId);
  }

  @Get('revenue-trend')
  async getRevenueTrend(@CurrentUser('companyId') companyId: string) {
    return this.analyticsService.getRevenueTrend(companyId);
  }
}
