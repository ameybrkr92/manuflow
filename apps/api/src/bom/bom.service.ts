import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBOMItemDto {
  @ApiProperty() @IsString() partNo: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsNumber() qty: number;
  @ApiProperty() @IsString() uom: string;
  @ApiPropertyOptional({ enum: ['MAKE', 'BUY', 'SUB_CONTRACT'] })
  @IsOptional() @IsEnum(['MAKE', 'BUY', 'SUB_CONTRACT']) makeOrBuy?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() unitCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() level?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() parentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() materialId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CreateBOMDto {
  @ApiProperty() @IsString() productName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() salesOrderId?: string;
  @ApiPropertyOptional() @IsOptional() items?: CreateBOMItemDto[];
}

export class UpdateBOMDto {
  @ApiPropertyOptional() @IsOptional() @IsString() productName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

export class GenerateAiBOMDto {
  @ApiProperty() @IsString() productName: string;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() salesOrderId?: string;
}

@Injectable()
export class BomService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async findAll(companyId: string, salesOrderId?: string) {
    return this.prisma.bOM.findMany({
      where: {
        companyId,
        ...(salesOrderId ? { salesOrderId } : {}),
      },
      include: {
        _count: { select: { items: true } },
        salesOrder: { select: { orderNo: true, subject: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const bom = await this.prisma.bOM.findFirst({
      where: { id, companyId },
      include: {
        items: {
          include: { children: true },
          orderBy: [{ level: 'asc' }, { partNo: 'asc' }],
        },
        salesOrder: { select: { orderNo: true, subject: true, customer: { select: { name: true } } } },
      },
    });
    if (!bom) throw new NotFoundException('BOM not found');
    return bom;
  }

  async create(companyId: string, dto: CreateBOMDto, userId: string) {
    const count = await this.prisma.bOM.count({ where: { companyId } });
    const bomNo = `BOM-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.bOM.create({
      data: {
        companyId,
        bomNo,
        productName: dto.productName,
        description: dto.description,
        salesOrderId: dto.salesOrderId,
        items: dto.items ? {
          create: dto.items.map(item => ({
            partNo: item.partNo,
            description: item.description,
            qty: item.qty,
            uom: item.uom,
            makeOrBuy: item.makeOrBuy as any || 'BUY',
            unitCost: item.unitCost,
            totalCost: item.unitCost ? item.qty * item.unitCost : undefined,
            level: item.level || 1,
            parentId: item.parentId,
            materialId: item.materialId,
            notes: item.notes,
          })),
        } : undefined,
      },
      include: { items: true },
    });
  }

  async update(id: string, companyId: string, dto: UpdateBOMDto) {
    await this.findOne(id, companyId);
    return this.prisma.bOM.update({
      where: { id },
      data: dto,
    });
  }

  async approveBOM(id: string, companyId: string, userId: string) {
    await this.findOne(id, companyId);
    return this.prisma.bOM.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy: userId, approvedAt: new Date() },
    });
  }

  async addItem(bomId: string, companyId: string, dto: CreateBOMItemDto) {
    await this.findOne(bomId, companyId);
    return this.prisma.bOMItem.create({
      data: {
        bomId,
        partNo: dto.partNo,
        description: dto.description,
        qty: dto.qty,
        uom: dto.uom,
        makeOrBuy: dto.makeOrBuy as any || 'BUY',
        unitCost: dto.unitCost,
        totalCost: dto.unitCost ? dto.qty * dto.unitCost : undefined,
        level: dto.level || 1,
        parentId: dto.parentId,
        materialId: dto.materialId,
        notes: dto.notes,
      },
    });
  }

  async removeItem(itemId: string, companyId: string) {
    return this.prisma.bOMItem.delete({ where: { id: itemId } });
  }

  async generateAiBOM(companyId: string, dto: GenerateAiBOMDto, userId: string) {
    const prompt = `Generate a detailed Bill of Materials (BOM) for the following manufacturing product:

Product Name: ${dto.productName}
Description: ${dto.description}

Return a JSON array of BOM line items with this exact structure:
[
  {
    "partNo": "string",
    "description": "string",
    "qty": number,
    "uom": "string (Nos/kg/m/L/Set/Pcs)",
    "makeOrBuy": "MAKE|BUY|SUB_CONTRACT",
    "unitCost": number (estimated in INR),
    "level": 1,
    "notes": "string (optional)"
  }
]

This is for an Indian SPM/Capital Goods manufacturer. Include all sub-assemblies, bought-out parts, raw materials, and standard components. Use realistic part numbers and INR costs.`;

    const content = await this.ai.generateJson(prompt);
    let items: any[] = [];
    try {
      items = JSON.parse(content);
    } catch {
      items = [];
    }

    const count = await this.prisma.bOM.count({ where: { companyId } });
    const bomNo = `BOM-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.bOM.create({
      data: {
        companyId,
        bomNo,
        productName: dto.productName,
        description: dto.description,
        salesOrderId: dto.salesOrderId,
        isAiGenerated: true,
        items: {
          create: items.map((item: any) => ({
            partNo: item.partNo || 'PART-001',
            description: item.description,
            qty: item.qty || 1,
            uom: item.uom || 'Nos',
            makeOrBuy: item.makeOrBuy || 'BUY',
            unitCost: item.unitCost,
            totalCost: item.unitCost ? item.qty * item.unitCost : undefined,
            level: item.level || 1,
            notes: item.notes,
          })),
        },
      },
      include: { items: true },
    });
  }
}
