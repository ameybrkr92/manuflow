import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(companyId: string, data: any) {
    // Generate Invoice number
    const count = await this.prisma.invoice.count({ where: { companyId } });
    const invoiceNo = `INV-${new Date().getFullYear() % 100}-${(count + 1).toString().padStart(4, '0')}`;

    return this.prisma.invoice.create({
      data: {
        companyId,
        invoiceNo,
        ...data
      }
    });
  }

  async getInvoices(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: {
        customer: { select: { name: true } },
        salesOrder: { select: { orderNo: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async recordPayment(companyId: string, id: string, amount: number) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId }
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    const newPaidAmount = Number(invoice.paidAmount) + amount;
    const status = newPaidAmount >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIALLY_PAID';

    return this.prisma.invoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        status: status as any
      }
    });
  }

  async getFinanceStats(companyId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { companyId }
    });

    const totalInvoiced = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
    const totalCollected = invoices.reduce((acc, inv) => acc + Number(inv.paidAmount), 0);
    const pendingCollection = totalInvoiced - totalCollected;

    return { totalInvoiced, totalCollected, pendingCollection };
  }
}
