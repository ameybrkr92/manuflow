import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMaterialDto {
  @ApiProperty() @IsString() partNo: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsString() uom: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hsnCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() reorderLevel?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() minStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valuationRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() storageLocation?: string;
}

export class StockAdjustmentDto {
  @ApiProperty() @IsNumber() qty: number;
  @ApiProperty() @IsNumber() rate: number;
  @ApiProperty() @IsString() documentRef: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async listMaterials(companyId: string, search?: string, category?: string) {
    return this.prisma.materialMaster.findMany({
      where: {
        companyId,
        isActive: true,
        ...(search ? { OR: [
          { partNo: { contains: search, mode: 'insensitive' as any } },
          { description: { contains: search, mode: 'insensitive' as any } },
        ]} : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { partNo: 'asc' },
    });
  }

  async getMaterial(companyId: string, id: string) {
    const m = await this.prisma.materialMaster.findFirst({
      where: { id, companyId },
      include: {
        stockLedger: { orderBy: { transactedAt: 'desc' }, take: 20 },
      },
    });
    if (!m) throw new NotFoundException('Material not found');
    return m;
  }

  async createMaterial(companyId: string, dto: CreateMaterialDto) {
    return this.prisma.materialMaster.create({
      data: {
        companyId,
        partNo: dto.partNo,
        description: dto.description,
        uom: dto.uom,
        hsnCode: dto.hsnCode,
        category: dto.category,
        reorderLevel: dto.reorderLevel || 0,
        minStock: dto.minStock || 0,
        maxStock: dto.maxStock || 0,
        valuationRate: dto.valuationRate || 0,
        storageLocation: dto.storageLocation,
      },
    });
  }

  async updateMaterial(companyId: string, id: string, dto: Partial<CreateMaterialDto>) {
    await this.getMaterial(companyId, id);
    return this.prisma.materialMaster.update({ where: { id }, data: dto as any });
  }

  async adjustStock(companyId: string, materialId: string, type: 'in' | 'out', dto: StockAdjustmentDto, userId: string) {
    const material = await this.getMaterial(companyId, materialId);
    const qty = type === 'in' ? Math.abs(dto.qty) : -Math.abs(dto.qty);
    const newStock = parseFloat(material.currentStock.toString()) + qty;
    const value = Math.abs(dto.qty) * dto.rate;

    const [updatedMaterial, ledger] = await this.prisma.$transaction([
      this.prisma.materialMaster.update({
        where: { id: materialId },
        data: { currentStock: newStock, valuationRate: dto.rate },
      }),
      this.prisma.stockLedger.create({
        data: {
          companyId,
          materialId,
          transactionType: type === 'in' ? 'ADJUSTMENT' : 'ADJUSTMENT',
          qty: Math.abs(dto.qty),
          rate: dto.rate,
          value,
          balanceQty: newStock,
          documentRef: dto.documentRef,
          documentType: 'ADJUSTMENT',
          notes: dto.notes,
          transactedBy: userId,
        },
      }),
    ]);

    return { material: updatedMaterial, ledger };
  }

  async getLowStockAlerts(companyId: string) {
    return this.prisma.materialMaster.findMany({
      where: {
        companyId,
        isActive: true,
        // Items where currentStock <= reorderLevel
      },
      orderBy: { partNo: 'asc' },
    }).then(items => items.filter(m =>
      parseFloat(m.currentStock.toString()) <= parseFloat(m.reorderLevel.toString())
    ));
  }

  async getCategories(companyId: string) {
    const materials = await this.prisma.materialMaster.findMany({
      where: { companyId },
      select: { category: true },
      distinct: ['category'],
    });
    return materials.map(m => m.category).filter(Boolean);
  }

  async getDashboard(companyId: string) {
    const [totalItems, lowStock, totalValue] = await Promise.all([
      this.prisma.materialMaster.count({ where: { companyId, isActive: true } }),
      this.prisma.materialMaster.count({ where: { companyId, isActive: true } }),
      this.prisma.materialMaster.findMany({ where: { companyId, isActive: true }, select: { currentStock: true, valuationRate: true } }),
    ]);

    const inventoryValue = totalValue.reduce((sum, m) => {
      return sum + parseFloat(m.currentStock.toString()) * parseFloat(m.valuationRate.toString());
    }, 0);

    const lowStockItems = await this.getLowStockAlerts(companyId);
    const recentTransactions = await this.prisma.stockLedger.findMany({
      where: { companyId },
      orderBy: { transactedAt: 'desc' },
      take: 10,
      include: { material: { select: { partNo: true, description: true, uom: true } } },
    });

    return {
      totalItems,
      lowStockCount: lowStockItems.length,
      inventoryValue,
      lowStockItems: lowStockItems.slice(0, 10),
      recentTransactions,
    };
  }
}
