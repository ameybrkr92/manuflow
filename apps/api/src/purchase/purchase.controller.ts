import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  PurchaseService, CreateVendorDto, CreatePRDto, CreatePODto, CreateGRNDto,
} from './purchase.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { POStatus, PRStatus } from '@prisma/client';

@ApiTags('Purchase')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly service: PurchaseService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Purchase dashboard stats' })
  getDashboard(@CurrentUser('companyId') cid: string) {
    return this.service.getDashboard(cid);
  }

  // ── Vendors ───────────────────────────────────────────────────

  @Get('vendors')
  @ApiOperation({ summary: 'List vendors' })
  listVendors(@CurrentUser('companyId') cid: string, @Query('search') search?: string) {
    return this.service.listVendors(cid, search);
  }

  @Get('vendors/:id')
  @ApiOperation({ summary: 'Get vendor detail' })
  getVendor(@CurrentUser('companyId') cid: string, @Param('id') id: string) {
    return this.service.getVendor(cid, id);
  }

  @Post('vendors')
  @ApiOperation({ summary: 'Create vendor' })
  createVendor(@CurrentUser('companyId') cid: string, @Body() dto: CreateVendorDto) {
    return this.service.createVendor(cid, dto);
  }

  @Put('vendors/:id')
  @ApiOperation({ summary: 'Update vendor' })
  updateVendor(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateVendorDto>,
  ) {
    return this.service.updateVendor(cid, id, dto);
  }

  // ── Purchase Requisitions ─────────────────────────────────────

  @Get('pr')
  @ApiOperation({ summary: 'List purchase requisitions' })
  listPRs(@CurrentUser('companyId') cid: string, @Query('status') status?: PRStatus) {
    return this.service.listPRs(cid, status);
  }

  @Post('pr')
  @ApiOperation({ summary: 'Create purchase requisition' })
  createPR(
    @CurrentUser('companyId') cid: string,
    @CurrentUser('id') uid: string,
    @Body() dto: CreatePRDto,
  ) {
    return this.service.createPR(cid, uid, dto);
  }

  @Put('pr/:id/status')
  @ApiOperation({ summary: 'Update PR status' })
  updatePRStatus(
    @CurrentUser('companyId') cid: string,
    @CurrentUser('id') uid: string,
    @Param('id') id: string,
    @Body('status') status: PRStatus,
  ) {
    return this.service.updatePRStatus(cid, id, status, uid);
  }

  // ── Purchase Orders ───────────────────────────────────────────

  @Get('po')
  @ApiOperation({ summary: 'List purchase orders' })
  listPOs(@CurrentUser('companyId') cid: string, @Query('status') status?: POStatus) {
    return this.service.listPOs(cid, status);
  }

  @Get('po/:id')
  @ApiOperation({ summary: 'Get purchase order detail' })
  getPO(@CurrentUser('companyId') cid: string, @Param('id') id: string) {
    return this.service.getPO(cid, id);
  }

  @Post('po')
  @ApiOperation({ summary: 'Create purchase order' })
  createPO(@CurrentUser('companyId') cid: string, @Body() dto: CreatePODto) {
    return this.service.createPO(cid, dto);
  }

  @Put('po/:id/status')
  @ApiOperation({ summary: 'Update PO status' })
  updatePOStatus(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
    @Body('status') status: POStatus,
  ) {
    return this.service.updatePOStatus(cid, id, status);
  }

  @Post('po/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge purchase order' })
  acknowledgePO(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
  ) {
    return this.service.acknowledgePO(cid, id);
  }

  @Post('po/:id/invoice')
  @ApiOperation({ summary: 'Upload vendor invoice' })
  uploadInvoice(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
    @Body() data: { invoiceNo: string; invoiceUrl: string },
  ) {
    return this.service.uploadInvoice(cid, id, data);
  }

  // ── GRNs ─────────────────────────────────────────────────────

  @Get('grn')
  @ApiOperation({ summary: 'List GRNs' })
  listGRNs(@CurrentUser('companyId') cid: string) {
    return this.service.listGRNs(cid);
  }

  @Post('grn')
  @ApiOperation({ summary: 'Create GRN (goods receipt)' })
  createGRN(
    @CurrentUser('companyId') cid: string,
    @CurrentUser('id') uid: string,
    @Body() dto: CreateGRNDto,
  ) {
    return this.service.createGRN(cid, uid, dto);
  }

  @Put('grn/:id/status')
  @ApiOperation({ summary: 'Update GRN QC status' })
  updateGRNStatus(
    @CurrentUser('companyId') cid: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.service.updateGRNStatus(cid, id, status);
  }
}
