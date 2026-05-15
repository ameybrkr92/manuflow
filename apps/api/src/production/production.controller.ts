import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  ProductionService, CreateWorkCenterDto, CreateWorkOrderDto, CreateOperationDto,
} from './production.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkOrderStatus } from '@prisma/client';

@ApiTags('Production')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('production')
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Production dashboard stats' })
  getDashboard(@CurrentUser('companyId') cid: string) {
    return this.service.getProductionStats(cid);
  }

  // ── Work Centers ─────────────────────────────────────────────

  @Get('work-centers')
  @ApiOperation({ summary: 'List work centers' })
  listWorkCenters(@CurrentUser('companyId') cid: string) {
    return this.service.listWorkCenters(cid);
  }

  @Post('work-centers')
  @ApiOperation({ summary: 'Create work center' })
  createWorkCenter(
    @CurrentUser('companyId') cid: string,
    @Body() dto: CreateWorkCenterDto,
  ) {
    return this.service.createWorkCenter(cid, dto);
  }

  @Put('work-centers/:id')
  @ApiOperation({ summary: 'Update work center' })
  updateWorkCenter(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateWorkCenterDto>,
  ) {
    return this.service.updateWorkCenter(cid, id, dto);
  }

  // ── Work Orders ───────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List work orders' })
  listWorkOrders(
    @CurrentUser('companyId') cid: string,
    @Query('status') status?: string,
  ) {
    return this.service.listWorkOrders(cid, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work order detail' })
  getWorkOrder(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
  ) {
    return this.service.findOneWorkOrder(id, cid);
  }

  @Post()
  @ApiOperation({ summary: 'Create work order' })
  createWorkOrder(
    @CurrentUser('companyId') cid: string,
    @CurrentUser('id') uid: string,
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.service.createWorkOrder(cid, dto, uid);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update work order status' })
  updateStatus(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.service.updateWorkOrder(id, cid, { status: status as any });
  }

  @Put(':id/progress')
  @ApiOperation({ summary: 'Update work order progress %' })
  updateProgress(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
    @Body('progress') progress: number,
  ) {
    return this.service.updateWorkOrder(id, cid, { progress });
  }

  @Post(':id/operations')
  @ApiOperation({ summary: 'Add operation to work order' })
  addOperation(
    @CurrentUser('companyId') cid: string,
    @Param('id') workOrderId: string,
    @Body() dto: CreateOperationDto,
  ) {
    return this.service.addOperation(workOrderId, cid, dto);
  }
}
