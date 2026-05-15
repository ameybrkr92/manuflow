import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { POStatus, PRStatus } from '@prisma/client';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gstin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pan?: string;
  @ApiProperty() address: any;
  @ApiPropertyOptional() @IsOptional() contactPersons?: any[];
  @ApiPropertyOptional() @IsOptional() bankDetails?: any;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentTerms?: string;
  @ApiPropertyOptional() @IsOptional() categories?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isMSME?: boolean;
}

export class CreatePRDto {
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsNumber() qty: number;
  @ApiProperty() @IsString() uom: string;
  @ApiPropertyOptional() @IsOptional() @IsString() workOrderId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() materialId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() requiredBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CreatePODto {
  @ApiProperty() @IsString() vendorId: string;
  @ApiProperty() lineItems: any[];
  @ApiProperty() @IsNumber() subtotal: number;
  @ApiProperty() @IsNumber() taxAmount: number;
  @ApiProperty() @IsNumber() totalAmount: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() deliveryDate?: string;
  @ApiPropertyOptional() @IsOptional() deliveryAddr?: any;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentTerms?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() termsConditions?: string;
}

export class CreateGRNDto {
  @ApiProperty() @IsString() purchaseOrderId: string;
  @ApiProperty() @IsString() vendorId: string;
  @ApiProperty() lineItems: any[];
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

@Injectable()
export class PurchaseService {
  constructor(private prisma: PrismaService) {}

  // ── Vendors ───────────────────────────────────────────────────

  async listVendors(companyId: string, search?: string) {
    return this.prisma.vendor.findMany({
      where: {
        companyId,
        isActive: true,
        ...(search ? { name: { contains: search, mode: 'insensitive' as any } } : {}),
      },
      include: { _count: { select: { purchaseOrders: true, grns: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async getVendor(companyId: string, id: string) {
    const v = await this.prisma.vendor.findFirst({
      where: { id, companyId },
      include: {
        purchaseOrders: { orderBy: { createdAt: 'desc' }, take: 10 },
        grns: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!v) throw new NotFoundException('Vendor not found');
    return v;
  }

  async createVendor(companyId: string, dto: CreateVendorDto) {
    return this.prisma.vendor.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        gstin: dto.gstin,
        pan: dto.pan,
        address: dto.address || {},
        contactPersons: dto.contactPersons || [],
        bankDetails: dto.bankDetails,
        paymentTerms: dto.paymentTerms || '30 days',
        categories: dto.categories || [],
        isMSME: dto.isMSME || false,
      },
    });
  }

  async updateVendor(companyId: string, id: string, dto: Partial<CreateVendorDto>) {
    await this.getVendor(companyId, id);
    return this.prisma.vendor.update({ where: { id }, data: dto as any });
  }

  // ── Purchase Requisitions ─────────────────────────────────────

  async listPRs(companyId: string, status?: PRStatus) {
    return this.prisma.purchaseRequisition.findMany({
      where: { companyId, ...(status && { status }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPR(companyId: string, userId: string, dto: CreatePRDto) {
    const count = await this.prisma.purchaseRequisition.count({ where: { companyId } });
    const year = new Date().getFullYear().toString().slice(-2);
    const prNo = `PR${year}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.purchaseRequisition.create({
      data: {
        companyId,
        prNo,
        description: dto.description,
        qty: dto.qty,
        uom: dto.uom,
        workOrderId: dto.workOrderId,
        materialId: dto.materialId,
        requiredBy: dto.requiredBy ? new Date(dto.requiredBy) : undefined,
        raisedBy: userId,
        notes: dto.notes,
      },
    });
  }

  async updatePRStatus(companyId: string, id: string, status: PRStatus, userId: string) {
    return this.prisma.purchaseRequisition.update({
      where: { id },
      data: {
        status,
        ...(status === 'APPROVED' ? { approvedBy: userId, approvedAt: new Date() } : {}),
      },
    });
  }

  // ── Purchase Orders ───────────────────────────────────────────

  async listPOs(companyId: string, status?: POStatus) {
    return this.prisma.purchaseOrder.findMany({
      where: { companyId, ...(status && { status }) },
      include: {
        vendor: { select: { name: true, code: true } },
        _count: { select: { grns: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPO(companyId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, companyId },
      include: {
        vendor: true,
        grns: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!po) throw new NotFoundException('Purchase Order not found');
    return po;
  }

  async createPO(companyId: string, dto: CreatePODto) {
    const count = await this.prisma.purchaseOrder.count({ where: { companyId } });
    const year = new Date().getFullYear().toString().slice(-2);
    const poNo = `PO${year}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.purchaseOrder.create({
      data: {
        companyId,
        poNo,
        vendorId: dto.vendorId,
        lineItems: dto.lineItems,
        subtotal: dto.subtotal,
        taxAmount: dto.taxAmount,
        totalAmount: dto.totalAmount,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        deliveryAddr: dto.deliveryAddr,
        paymentTerms: dto.paymentTerms,
        notes: dto.notes,
        termsConditions: dto.termsConditions,
      },
      include: { vendor: { select: { name: true, code: true } } },
    });
  }

  async updatePOStatus(companyId: string, id: string, status: POStatus) {
    await this.getPO(companyId, id);
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status } });
  }

  async acknowledgePO(companyId: string, id: string) {
    await this.getPO(companyId, id);
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: POStatus.ACKNOWLEDGED },
    });
  }

  async uploadInvoice(companyId: string, id: string, data: { invoiceNo: string; invoiceUrl: string }) {
    await this.getPO(companyId, id);
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        vendorInvoiceNo: data.invoiceNo,
        vendorInvoiceUrl: data.invoiceUrl,
      },
    });
  }

  // ── GRNs ─────────────────────────────────────────────────────

  async listGRNs(companyId: string) {
    return this.prisma.gRN.findMany({
      where: { companyId },
      include: {
        vendor: { select: { name: true } },
        purchaseOrder: { select: { poNo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createGRN(companyId: string, userId: string, dto: CreateGRNDto) {
    const count = await this.prisma.gRN.count({ where: { companyId } });
    const year = new Date().getFullYear().toString().slice(-2);
    const grnNo = `GRN${year}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.gRN.create({
      data: {
        companyId,
        grnNo,
        purchaseOrderId: dto.purchaseOrderId,
        vendorId: dto.vendorId,
        lineItems: dto.lineItems,
        receivedBy: userId,
        notes: dto.notes,
      },
    });
  }

  async updateGRNStatus(companyId: string, id: string, status: string) {
    return this.prisma.gRN.update({ where: { id }, data: { status: status as any } });
  }

  async getDashboard(companyId: string) {
    const [openPRs, openPOs, pendingGRNs, vendors] = await Promise.all([
      this.prisma.purchaseRequisition.count({ where: { companyId, status: { in: ['DRAFT', 'PENDING_APPROVAL'] } } }),
      this.prisma.purchaseOrder.count({ where: { companyId, status: { in: ['DRAFT', 'SENT', 'ACKNOWLEDGED'] } } }),
      this.prisma.gRN.count({ where: { companyId, status: 'PENDING_QC' } }),
      this.prisma.vendor.count({ where: { companyId, isActive: true } }),
    ]);

    const recentPOs = await this.prisma.purchaseOrder.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { vendor: { select: { name: true } } },
    });

    return { openPRs, openPOs, pendingGRNs, vendors, recentPOs };
  }
}
