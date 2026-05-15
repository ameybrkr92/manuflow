import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SalesOrderStatus } from '@prisma/client';

@Injectable()
export class SalesOrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, status?: SalesOrderStatus) {
    return this.prisma.salesOrder.findMany({
      where: { companyId, ...(status && { status }) },
      include: {
        customer: { select: { name: true, code: true } },
        paymentMilestones: true,
        _count: { select: { workOrders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const so = await this.prisma.salesOrder.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        quotation: { select: { quotationNo: true } },
        paymentMilestones: { orderBy: { createdAt: 'asc' } },
        workOrders: { select: { workOrderNo: true, status: true, progress: true, productName: true } },
        invoices: { select: { invoiceNo: true, totalAmount: true, status: true } },
        boms: { select: { bomNo: true, version: true, status: true } },
      },
    });
    if (!so) throw new NotFoundException('Sales Order not found');
    return so;
  }

  async updateMilestone(companyId: string, soId: string, milestoneId: string, data: any) {
    const so = await this.findOne(companyId, soId);
    const milestone = so.paymentMilestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new NotFoundException('Milestone not found');
    return this.prisma.paymentMilestone.update({ where: { id: milestoneId }, data });
  }

  async updateStatus(companyId: string, id: string, status: SalesOrderStatus) {
    await this.findOne(companyId, id);
    return this.prisma.salesOrder.update({ where: { id }, data: { status } });
  }

  async approveDesign(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id);
    return this.prisma.salesOrder.update({
      where: { id },
      data: {
        status: SalesOrderStatus.DESIGN_APPROVED,
        designApprovedAt: new Date(),
        designApprovedBy: userId,
      },
    });
  }

  async getDashboardStats(companyId: string) {
    const [orderBook, thisMonthRevenue, atRisk, recentOrders] = await Promise.all([
      this.prisma.salesOrder.aggregate({
        where: { companyId, status: { notIn: ['DELIVERED', 'CANCELLED'] } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: {
          companyId,
          status: { not: 'CANCELLED' },
          invoiceDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.salesOrder.count({
        where: {
          companyId,
          status: { notIn: ['DELIVERED', 'CANCELLED'] },
          deliveryDate: { lt: new Date() },
        },
      }),
      this.prisma.salesOrder.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: { select: { name: true } } },
      }),
    ]);

    return {
      orderBookValue: orderBook._sum.totalAmount || 0,
      openOrders: orderBook._count,
      revenueThisMonth: thisMonthRevenue._sum.totalAmount || 0,
      ordersAtRisk: atRisk,
      recentOrders,
    };
  }
}
