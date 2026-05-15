import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DispatchService {
  constructor(private prisma: PrismaService) {}

  async createDispatchAdvice(companyId: string, data: any) {
    // Generate DA number
    const count = await this.prisma.dispatchAdvice.count({ where: { companyId } });
    const daNo = `DA-${new Date().getFullYear() % 100}-${(count + 1).toString().padStart(4, '0')}`;

    return this.prisma.dispatchAdvice.create({
      data: {
        companyId,
        daNo,
        ...data
      }
    });
  }

  async getDispatchAdvices(companyId: string) {
    return this.prisma.dispatchAdvice.findMany({
      where: { companyId },
      include: {
        salesOrder: {
          select: { orderNo: true, customer: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateDispatchStatus(companyId: string, id: string, status: string, data: any = {}) {
    return this.prisma.dispatchAdvice.update({
      where: { id },
      data: {
        status,
        ...data
      }
    });
  }

  async getDispatchStats(companyId: string) {
    const [pending, dispatchedToday] = await Promise.all([
      this.prisma.dispatchAdvice.count({ where: { companyId, status: 'PLANNED' } }),
      this.prisma.dispatchAdvice.count({ 
        where: { 
          companyId, 
          status: 'DISPATCHED',
          dispatchDate: { gte: new Date(new Date().setHours(0,0,0,0)) }
        } 
      })
    ]);

    return { pending, dispatchedToday };
  }
}
