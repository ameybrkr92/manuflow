import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getExecutiveKpis(companyId: string) {
    const [sales, production, quality, finance] = await Promise.all([
      this.getSalesKpis(companyId),
      this.getProductionKpis(companyId),
      this.getQualityKpis(companyId),
      this.getFinanceKpis(companyId)
    ]);

    return { sales, production, quality, finance };
  }

  private async getSalesKpis(companyId: string) {
    const orders = await this.prisma.salesOrder.findMany({ where: { companyId } });
    const totalRevenue = orders.reduce((acc, o) => acc + Number(o.totalAmount), 0);
    const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
    
    return {
      totalRevenue,
      avgOrderValue,
      orderCount: orders.length
    };
  }

  private async getProductionKpis(companyId: string) {
    const workOrders = await this.prisma.workOrder.findMany({ where: { companyId } });
    const completed = workOrders.filter(w => w.status === 'COMPLETED').length;
    const onTimeDelivery = workOrders.length ? (completed / workOrders.length) * 100 : 0;

    return {
      totalWorkOrders: workOrders.length,
      completionRate: workOrders.length ? (completed / workOrders.length) * 100 : 0,
      onTimeDelivery
    };
  }

  private async getQualityKpis(companyId: string) {
    const inspections = await this.prisma.inspectionRecord.findMany({ where: { companyId } });
    const passed = inspections.filter(i => i.overallResult === 'PASS').length;
    const firstPassYield = inspections.length ? (passed / inspections.length) * 100 : 0;

    return {
      totalInspections: inspections.length,
      firstPassYield,
      openNCRs: await this.prisma.nCR.count({ where: { companyId, status: 'OPEN' } })
    };
  }

  private async getFinanceKpis(companyId: string) {
    const invoices = await this.prisma.invoice.findMany({ where: { companyId } });
    const totalInvoiced = invoices.reduce((acc, i) => acc + Number(i.totalAmount), 0);
    const totalCollected = invoices.reduce((acc, i) => acc + Number(i.paidAmount), 0);
    const collectionEfficiency = totalInvoiced ? (totalCollected / totalInvoiced) * 100 : 0;

    return {
      totalInvoiced,
      totalCollected,
      collectionEfficiency
    };
  }

  async getRevenueTrend(companyId: string) {
    // Group by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        invoiceDate: { gte: sixMonthsAgo }
      },
      select: {
        invoiceDate: true,
        totalAmount: true
      }
    });

    const trend = {};
    invoices.forEach(inv => {
      const month = inv.invoiceDate.toLocaleString('default', { month: 'short' });
      trend[month] = (trend[month] || 0) + Number(inv.totalAmount);
    });

    return Object.entries(trend).map(([month, value]) => ({ month, value }));
  }
}
