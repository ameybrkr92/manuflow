import { Controller, Get, Put, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SalesOrdersService } from './sales-orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SalesOrderStatus } from '@prisma/client';

@ApiTags('Sales Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly service: SalesOrdersService) {}

  @Get()
  findAll(@CurrentUser('companyId') cid: string, @Query('status') status?: SalesOrderStatus) {
    return this.service.findAll(cid, status);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser('companyId') cid: string) {
    return this.service.getDashboardStats(cid);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') cid: string, @Param('id') id: string) {
    return this.service.findOne(cid, id);
  }

  @Put(':id/status')
  updateStatus(@CurrentUser('companyId') cid: string, @Param('id') id: string, @Body('status') status: SalesOrderStatus) {
    return this.service.updateStatus(cid, id, status);
  }

  @Post(':id/approve-design')
  approveDesign(@CurrentUser('companyId') cid: string, @CurrentUser('id') uid: string, @Param('id') id: string) {
    return this.service.approveDesign(cid, id, uid);
  }

  @Put(':id/milestones/:milestoneId')
  updateMilestone(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() data: any,
  ) {
    return this.service.updateMilestone(cid, id, milestoneId, data);
  }
}
