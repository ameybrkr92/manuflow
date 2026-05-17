import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkCenterDto {
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() capacityHrsDay?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() shifts?: number;
}

export class CreateWorkOrderDto {
  @ApiProperty() @IsString() salesOrderId: string;
  @ApiProperty() @IsString() productName: string;
  @ApiProperty() @IsNumber() qty: number;
  @ApiPropertyOptional() @IsOptional() @IsString() bomId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() plannedStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() plannedEnd?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() priority?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateWorkOrderDto {
  @ApiPropertyOptional() @IsOptional() @IsEnum(['PLANNED','RELEASED','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED']) status?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() progress?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() actualStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() actualEnd?: string;
}

export class CreateOperationDto {
  @ApiProperty() @IsString() workCenterId: string;
  @ApiProperty() @IsString() operationName: string;
  @ApiProperty() @IsNumber() sequence: number;
  @ApiProperty() @IsNumber() plannedHours: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() plannedStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() plannedEnd?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  // ── Work Centers ──
  async listWorkCenters(companyId: string) {
    return this.prisma.workCenter.findMany({
      where: { companyId, isActive: true },
      include: { _count: { select: { jobCards: true, workOrderOps: true } } },
      orderBy: { code: 'asc' },
    });
  }

  async createWorkCenter(companyId: string, dto: CreateWorkCenterDto) {
    return this.prisma.workCenter.create({
      data: { companyId, ...dto },
    });
  }

  async updateWorkCenter(companyId: string, id: string, dto: Partial<CreateWorkCenterDto>) {
    return this.prisma.workCenter.update({
      where: { id, companyId },
      data: dto,
    });
  }

  // ── Work Orders ──
  async listWorkOrders(companyId: string, status?: string) {
    return this.prisma.workOrder.findMany({
      where: {
        companyId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        salesOrder: { select: { orderNo: true, customer: { select: { name: true } } } },
        _count: { select: { operations: true, jobCards: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneWorkOrder(id: string, companyId: string) {
    const wo = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: {
        salesOrder: { select: { orderNo: true, subject: true, customer: { select: { name: true } } } },
        operations: {
          include: { workCenter: { select: { code: true, name: true } } },
          orderBy: { sequence: 'asc' },
        },
        jobCards: {
          include: { workCenter: { select: { code: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        ncrs: { select: { ncrNo: true, title: true, status: true }, take: 5 },
      },
    });
    if (!wo) throw new NotFoundException('Work Order not found');
    return wo;
  }

  async createWorkOrder(companyId: string, dto: CreateWorkOrderDto, userId: string) {
    const count = await this.prisma.workOrder.count({ where: { companyId } });
    const workOrderNo = `WO-${String(count + 1).padStart(5, '0')}`;
    return this.prisma.workOrder.create({
      data: {
        companyId,
        workOrderNo,
        salesOrderId: dto.salesOrderId,
        bomId: dto.bomId,
        productName: dto.productName,
        qty: dto.qty,
        plannedStart: dto.plannedStart ? new Date(dto.plannedStart) : undefined,
        plannedEnd: dto.plannedEnd ? new Date(dto.plannedEnd) : undefined,
        priority: dto.priority || 5,
        notes: dto.notes,
      },
      include: { salesOrder: { select: { orderNo: true } } },
    });
  }

  async updateWorkOrder(id: string, companyId: string, dto: UpdateWorkOrderDto) {
    await this.findOneWorkOrder(id, companyId);
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status as any,
        actualStart: dto.actualStart ? new Date(dto.actualStart) : undefined,
        actualEnd: dto.actualEnd ? new Date(dto.actualEnd) : undefined,
      },
    });
  }


  async releaseWorkOrder(id: string, companyId: string) {
    await this.findOneWorkOrder(id, companyId);
    return this.prisma.workOrder.update({
      where: { id },
      data: { status: 'RELEASED', actualStart: new Date() },
    });
  }

  // ── Operations ──
  async addOperation(workOrderId: string, companyId: string, dto: CreateOperationDto) {
    await this.findOneWorkOrder(workOrderId, companyId);
    return this.prisma.workOrderOperation.create({
      data: {
        workOrderId,
        workCenterId: dto.workCenterId,
        operationName: dto.operationName,
        sequence: dto.sequence,
        plannedHours: dto.plannedHours,
        plannedStart: dto.plannedStart ? new Date(dto.plannedStart) : undefined,
        plannedEnd: dto.plannedEnd ? new Date(dto.plannedEnd) : undefined,
        notes: dto.notes,
      },
    });
  }

  // ── Dashboard stats ──
  async getProductionStats(companyId: string) {
    const [total, planned, inProgress, completed, overdue] = await Promise.all([
      this.prisma.workOrder.count({ where: { companyId } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'PLANNED' } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'COMPLETED' } }),
      this.prisma.workOrder.count({
        where: {
          companyId,
          status: { in: ['PLANNED', 'IN_PROGRESS', 'RELEASED'] },
          plannedEnd: { lt: new Date() },
        },
      }),
    ]);
    return { total, planned, inProgress, completed, overdue };
  }
}
