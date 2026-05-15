import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuotationStatus } from '@prisma/client';

export class CreateQuotationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() enquiryId?: string;
  @ApiProperty() @IsString() customerId: string;
  @ApiPropertyOptional() lineItems?: any[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() subtotal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() taxAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalAmount?: number;
  @ApiPropertyOptional() taxBreakup?: any;
  @ApiPropertyOptional() @IsOptional() validUntil?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() deliveryWeeks?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentTerms?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() termsConditions?: string;
}

export class GenerateAiQuotationDto {
  @ApiProperty() @IsString() enquiryId: string;
}

@Injectable()
export class QuotationsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  private async nextQuotationNo(companyId: string): Promise<string> {
    const count = await this.prisma.quotation.count({ where: { companyId } });
    const year = new Date().getFullYear().toString().slice(-2);
    return `QT${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(companyId: string, status?: QuotationStatus) {
    return this.prisma.quotation.findMany({
      where: { companyId, ...(status && { status }) },
      include: {
        enquiry: { select: { enquiryNo: true, subject: true } },
        salesOrders: { select: { orderNo: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const q = await this.prisma.quotation.findFirst({
      where: { id, companyId },
      include: {
        enquiry: true,
        salesOrders: { select: { orderNo: true, status: true, totalAmount: true } },
      },
    });
    if (!q) throw new NotFoundException('Quotation not found');
    return q;
  }

  async create(companyId: string, dto: CreateQuotationDto) {
    const quotationNo = await this.nextQuotationNo(companyId);
    const lineItems = dto.lineItems || [];
    const subtotal = dto.subtotal || lineItems.reduce((s: number, i: any) => s + (i.amount || 0), 0);
    const taxAmount = dto.taxAmount || subtotal * 0.18;
    const totalAmount = dto.totalAmount || subtotal + taxAmount;

    return this.prisma.quotation.create({
      data: {
        companyId,
        quotationNo,
        enquiryId: dto.enquiryId,
        customerId: dto.customerId,
        lineItems,
        subtotal,
        taxAmount,
        totalAmount,
        taxBreakup: dto.taxBreakup,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        deliveryWeeks: dto.deliveryWeeks,
        paymentTerms: dto.paymentTerms,
        notes: dto.notes,
        termsConditions: dto.termsConditions,
        status: 'DRAFT',
      },
    });
  }

  async generateAiQuotation(companyId: string, dto: GenerateAiQuotationDto) {
    const enquiry = await this.prisma.enquiry.findFirst({
      where: { id: dto.enquiryId, companyId },
      include: { customer: true },
    });
    if (!enquiry) throw new NotFoundException('Enquiry not found');

    // Fetch similar past orders for context
    const similarOrders = await this.prisma.salesOrder.findMany({
      where: { companyId, status: { notIn: ['CANCELLED'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { orderNo: true, subject: true, totalAmount: true, deliveryDate: true },
    });

    const aiResponse = await this.aiService.generateQuotation({
      enquiry,
      customer: enquiry.customer,
      similarOrders,
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      parsed = { notes: aiResponse, lineItems: [], subtotal: 0, taxAmount: 0, totalAmount: 0 };
    }

    // Save the AI-generated quotation
    const quotationNo = await this.nextQuotationNo(companyId);
    return this.prisma.quotation.create({
      data: {
        companyId,
        quotationNo,
        enquiryId: dto.enquiryId,
        customerId: enquiry.customerId,
        lineItems: parsed.lineItems || [],
        subtotal: parsed.subtotal || 0,
        taxAmount: parsed.taxAmount || 0,
        totalAmount: parsed.totalAmount || 0,
        taxBreakup: { gstType: parsed.gstType, gstRate: parsed.gstRate },
        deliveryWeeks: parsed.deliveryWeeks,
        paymentTerms: enquiry.customer.paymentTerms,
        notes: parsed.notes,
        termsConditions: parsed.termsConditions,
        status: 'DRAFT',
        isAiGenerated: true,
        aiPrompt: JSON.stringify(parsed.aiSummary),
      },
    });
  }

  async updateStatus(companyId: string, id: string, status: QuotationStatus, userId: string) {
    await this.findOne(companyId, id);
    return this.prisma.quotation.update({
      where: { id },
      data: {
        status,
        ...(status === 'APPROVED' && { approvedBy: userId, approvedAt: new Date() }),
      },
    });
  }

  async convertToOrder(companyId: string, id: string) {
    const quotation = await this.findOne(companyId, id);
    const count = await this.prisma.salesOrder.count({ where: { companyId } });
    const year = new Date().getFullYear().toString().slice(-2);
    const orderNo = `SO${year}-${String(count + 1).padStart(4, '0')}`;

    const order = await this.prisma.salesOrder.create({
      data: {
        companyId,
        orderNo,
        customerId: quotation.customerId,
        quotationId: id,
        subject: quotation.enquiry?.subject || 'Sales Order',
        lineItems: quotation.lineItems as any,
        subtotal: quotation.subtotal,
        taxAmount: quotation.taxAmount,
        totalAmount: quotation.totalAmount,
        status: 'CONFIRMED',
        paymentSchedule: [],
      },
    });

    await this.prisma.quotation.update({ where: { id }, data: { status: 'APPROVED' } });
    return order;
  }
}
