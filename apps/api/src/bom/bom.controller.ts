import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BomService, CreateBOMDto, UpdateBOMDto, CreateBOMItemDto, GenerateAiBOMDto } from './bom.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('BOM')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bom')
export class BomController {
  constructor(private readonly service: BomService) {}

  @Get()
  @ApiOperation({ summary: 'List all BOMs' })
  findAll(
    @CurrentUser('companyId') cid: string,
    @Query('salesOrderId') salesOrderId?: string,
  ) {
    return this.service.findAll(cid, salesOrderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get BOM with all items' })
  findOne(@CurrentUser('companyId') cid: string, @Param('id') id: string) {
    return this.service.findOne(id, cid);
  }

  @Post()
  @ApiOperation({ summary: 'Create new BOM manually' })
  create(
    @CurrentUser('companyId') cid: string,
    @CurrentUser('id') uid: string,
    @Body() dto: CreateBOMDto,
  ) {
    return this.service.create(cid, dto, uid);
  }

  @Post('ai-generate')
  @ApiOperation({ summary: 'AI-generate BOM from product description' })
  generateAiBOM(
    @CurrentUser('companyId') cid: string,
    @CurrentUser('id') uid: string,
    @Body() dto: GenerateAiBOMDto,
  ) {
    return this.service.generateAiBOM(cid, dto, uid);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update BOM metadata' })
  update(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
    @Body() dto: UpdateBOMDto,
  ) {
    return this.service.update(id, cid, dto);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve BOM' })
  approveBOM(
    @CurrentUser('companyId') cid: string,
    @CurrentUser('id') uid: string,
    @Param('id') id: string,
  ) {
    return this.service.approveBOM(id, cid, uid);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add a BOM line item' })
  addItem(
    @CurrentUser('companyId') cid: string,
    @Param('id') bomId: string,
    @Body() dto: CreateBOMItemDto,
  ) {
    return this.service.addItem(bomId, cid, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove a BOM line item' })
  removeItem(
    @CurrentUser('companyId') cid: string,
    @Param('itemId') itemId: string,
  ) {
    return this.service.removeItem(itemId, cid);
  }
}
