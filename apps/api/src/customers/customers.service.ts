import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gstin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pan?: string;
  @ApiProperty() billingAddress: any;
  @ApiPropertyOptional() shippingAddress?: any;
  @ApiPropertyOptional() contactPersons?: any[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) creditLimit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentTerms?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, search?: string) {
    return this.prisma.customer.findMany({
      where: {
        companyId,
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { gstin: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        _count: { select: { salesOrders: true, enquiries: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
      include: {
        enquiries: { orderBy: { createdAt: 'desc' }, take: 5 },
        salesOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { paymentMilestones: true },
        },
        invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(companyId: string, userId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        gstin: dto.gstin,
        pan: dto.pan,
        billingAddress: dto.billingAddress || {},
        shippingAddress: dto.shippingAddress,
        contactPersons: dto.contactPersons || [],
        creditLimit: dto.creditLimit || 0,
        paymentTerms: dto.paymentTerms || '30 days',
        notes: dto.notes,
      },
    });
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(companyId, id);
    return this.prisma.customer.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        gstin: dto.gstin,
        pan: dto.pan,
        billingAddress: dto.billingAddress,
        shippingAddress: dto.shippingAddress,
        contactPersons: dto.contactPersons,
        creditLimit: dto.creditLimit,
        paymentTerms: dto.paymentTerms,
        notes: dto.notes,
      },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.customer.update({ where: { id }, data: { isActive: false } });
  }

  async getStats(companyId: string, id: string) {
    const [totalOrders, totalInvoiced, openOrders] = await Promise.all([
      this.prisma.salesOrder.count({ where: { companyId, customerId: id } }),
      this.prisma.invoice.aggregate({
        where: { companyId, customerId: id, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      this.prisma.salesOrder.count({
        where: { companyId, customerId: id, status: { notIn: ['DELIVERED', 'CANCELLED'] } },
      }),
    ]);
    return { totalOrders, totalInvoiced: totalInvoiced._sum.totalAmount || 0, openOrders };
  }
}
