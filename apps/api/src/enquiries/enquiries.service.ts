import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnquiryStatus } from '@prisma/client';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnquiryDto {
  @ApiProperty() @IsString() customerId: string;
  @ApiProperty() @IsString() subject: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() specifications?: any;
  @ApiPropertyOptional() attachments?: string[];
  @ApiPropertyOptional() @IsOptional() deliveryRequired?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

@Injectable()
export class EnquiriesService {
  constructor(private prisma: PrismaService) {}

  private async nextEnquiryNo(companyId: string): Promise<string> {
    const count = await this.prisma.enquiry.count({ where: { companyId } });
    const year = new Date().getFullYear().toString().slice(-2);
    return `ENQ${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(companyId: string, status?: EnquiryStatus) {
    return this.prisma.enquiry.findMany({
      where: { companyId, ...(status && { status }) },
      include: {
        customer: { select: { name: true, code: true, gstin: true } },
        _count: { select: { quotations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const e = await this.prisma.enquiry.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        quotations: { orderBy: { version: 'desc' } },
      },
    });
    if (!e) throw new NotFoundException('Enquiry not found');
    return e;
  }

  async create(companyId: string, userId: string, dto: CreateEnquiryDto) {
    const enquiryNo = await this.nextEnquiryNo(companyId);
    return this.prisma.enquiry.create({
      data: {
        companyId,
        enquiryNo,
        customerId: dto.customerId,
        subject: dto.subject,
        description: dto.description,
        specifications: dto.specifications,
        attachments: dto.attachments || [],
        deliveryRequired: dto.deliveryRequired ? new Date(dto.deliveryRequired) : undefined,
        assignedTo: dto.assignedTo,
        notes: dto.notes,
        status: 'NEW',
      },
      include: { customer: { select: { name: true, code: true } } },
    });
  }

  async updateStatus(companyId: string, id: string, status: EnquiryStatus) {
    await this.findOne(companyId, id);
    return this.prisma.enquiry.update({ where: { id }, data: { status } });
  }

  async summarize(companyId: string, id: string) {
    const enquiry = await this.findOne(companyId, id);
    const aiSummary = await this.aiService.summarizeEnquiry({ enquiry });
    return this.prisma.enquiry.update({
      where: { id },
      data: { aiSummary },
    });
  }

  async update(companyId: string, id: string, dto: Partial<CreateEnquiryDto>) {
    await this.findOne(companyId, id);
    return this.prisma.enquiry.update({
      where: { id },
      data: { ...dto, deliveryRequired: dto.deliveryRequired ? new Date(dto.deliveryRequired) : undefined },
    });
  }
}
