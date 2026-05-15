import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { QualityService } from './quality.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('quality')
@UseGuards(JwtAuthGuard)
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Post('plans')
  async createPlan(@CurrentUser('companyId') companyId: string, @Body() data: any) {
    return this.qualityService.createInspectionPlan(companyId, data);
  }

  @Get('plans')
  async getPlans(@CurrentUser('companyId') companyId: string) {
    return this.qualityService.getInspectionPlans(companyId);
  }

  @Post('records')
  async recordInspection(@CurrentUser('companyId') companyId: string, @Body() data: any) {
    return this.qualityService.recordInspection(companyId, data);
  }

  @Get('records')
  async getRecords(@CurrentUser('companyId') companyId: string, @Query() query: any) {
    return this.qualityService.getInspectionRecords(companyId, query);
  }

  @Post('ncrs')
  async createNCR(@CurrentUser('companyId') companyId: string, @Body() data: any) {
    return this.qualityService.createNCR(companyId, data);
  }

  @Get('ncrs')
  async getNCRs(@CurrentUser('companyId') companyId: string) {
    return this.qualityService.getNCRs(companyId);
  }

  @Patch('ncrs/:id')
  async updateNCR(@CurrentUser('companyId') companyId: string, @Param('id') id: string, @Body() data: any) {
    return this.qualityService.updateNCR(companyId, id, data);
  }

  @Get('dashboard')
  async getDashboard(@CurrentUser('companyId') companyId: string) {
    return this.qualityService.getQualityStats(companyId);
  }
}
