import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventoryService, CreateMaterialDto, StockAdjustmentDto } from './inventory.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Inventory dashboard stats' })
  getDashboard(@CurrentUser('companyId') cid: string) {
    return this.service.getDashboard(cid);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock alerts' })
  getLowStockAlerts(@CurrentUser('companyId') cid: string) {
    return this.service.getLowStockAlerts(cid);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get material categories' })
  getCategories(@CurrentUser('companyId') cid: string) {
    return this.service.getCategories(cid);
  }

  @Get()
  @ApiOperation({ summary: 'List all materials / material master' })
  listMaterials(
    @CurrentUser('companyId') cid: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.service.listMaterials(cid, search, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get material with stock ledger' })
  getMaterial(@CurrentUser('companyId') cid: string, @Param('id') id: string) {
    return this.service.getMaterial(cid, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new material in master' })
  createMaterial(@CurrentUser('companyId') cid: string, @Body() dto: CreateMaterialDto) {
    return this.service.createMaterial(cid, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update material master record' })
  updateMaterial(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateMaterialDto>,
  ) {
    return this.service.updateMaterial(cid, id, dto);
  }

  @Post(':id/stock-in')
  @ApiOperation({ summary: 'Record stock receipt (GRN, return)' })
  stockIn(
    @CurrentUser('companyId') cid: string,
    @CurrentUser('id') uid: string,
    @Param('id') id: string,
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.service.adjustStock(cid, id, 'in', dto, uid);
  }

  @Post(':id/stock-out')
  @ApiOperation({ summary: 'Record stock issue (to job, scrap)' })
  stockOut(
    @CurrentUser('companyId') cid: string,
    @CurrentUser('id') uid: string,
    @Param('id') id: string,
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.service.adjustStock(cid, id, 'out', dto, uid);
  }
}
