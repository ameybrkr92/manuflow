import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QualityService {
  constructor(private prisma: PrismaService) {}

  async createInspectionPlan(companyId: string, data: any) {
    return this.prisma.inspectionPlan.create({
      data: {
        companyId,
        ...data
      }
    });
  }

  async getInspectionPlans(companyId: string) {
    return this.prisma.inspectionPlan.findMany({
      where: { companyId },
      orderBy: { partNo: 'asc' }
    });
  }

  async recordInspection(companyId: string, data: any) {
    const record = await this.prisma.inspectionRecord.create({
      data: {
        companyId,
        ...data
      }
    });

    // If inspection failed, we could trigger something or just let user create NCR manually
    return record;
  }

  async getInspectionRecords(companyId: string, query: any) {
    return this.prisma.inspectionRecord.findMany({
      where: { 
        companyId,
        ...(query.workOrderId && { workOrderId: query.workOrderId }),
        ...(query.grnId && { grnId: query.grnId }),
      },
      include: {
        workOrder: { select: { workOrderNo: true, productName: true } },
        ncrs: true
      },
      orderBy: { inspectedAt: 'desc' }
    });
  }

  async createNCR(companyId: string, data: any) {
    // Generate NCR number
    const count = await this.prisma.nCR.count({ where: { companyId } });
    const ncrNo = `NCR-${new Date().getFullYear() % 100}-${(count + 1).toString().padStart(4, '0')}`;

    return this.prisma.nCR.create({
      data: {
        companyId,
        ncrNo,
        ...data
      }
    });
  }

  async getNCRs(companyId: string) {
    return this.prisma.nCR.findMany({
      where: { companyId },
      include: {
        inspection: true,
        workOrder: { select: { workOrderNo: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateNCR(companyId: string, id: string, data: any) {
    return this.prisma.nCR.update({
      where: { id },
      data
    });
  }

  async getQualityStats(companyId: string) {
    const [totalInspections, openNCRs] = await Promise.all([
      this.prisma.inspectionRecord.count({ where: { companyId } }),
      this.prisma.nCR.count({ where: { companyId, status: 'OPEN' } })
    ]);

    const passRateResult = await this.prisma.inspectionRecord.groupBy({
      by: ['overallResult'],
      where: { companyId },
      _count: true
    });

    return { totalInspections, openNCRs, passRateResult };
  }
}
