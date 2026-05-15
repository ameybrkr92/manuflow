import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ShopFloorService } from './shop-floor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('shop-floor')
@UseGuards(JwtAuthGuard)
export class ShopFloorController {
  constructor(private readonly shopFloorService: ShopFloorService) {}

  @Get('jobs')
  async getJobs(
    @CurrentUser('companyId') companyId: string,
    @Query('workCenterId') workCenterId?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.shopFloorService.getActiveJobCards(companyId, assignedTo, workCenterId);
  }

  @Post('jobs/:id/start')
  async startJob(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.shopFloorService.startJob(companyId, id, userId);
  }

  @Post('jobs/:id/pause')
  async pauseJob(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.shopFloorService.pauseJob(companyId, id, reason);
  }

  @Post('jobs/:id/complete')
  async completeJob(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body('actualHours') actualHours: number,
  ) {
    return this.shopFloorService.completeJob(companyId, id, actualHours);
  }

  @Post('downtime')
  async logDowntime(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() data: any,
  ) {
    return this.shopFloorService.logDowntime(companyId, userId, data);
  }

  @Get('dashboard')
  async getDashboard(@CurrentUser('companyId') companyId: string) {
    return this.shopFloorService.getShopFloorStats(companyId);
  }
}
