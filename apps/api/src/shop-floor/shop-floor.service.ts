import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobCardStatus } from '@prisma/client';

@Injectable()
export class ShopFloorService {
  constructor(private prisma: PrismaService) {}

  async getActiveJobCards(companyId: string, assignedTo?: string, workCenterId?: string) {
    return this.prisma.jobCard.findMany({
      where: {
        companyId,
        status: { in: [JobCardStatus.PENDING, JobCardStatus.IN_PROGRESS] },
        ...(assignedTo && { assignedTo }),
        ...(workCenterId && { workCenterId }),
      },
      include: {
        workOrder: {
          select: { workOrderNo: true, productName: true, qty: true }
        },
        operation: {
          select: { operationName: true, sequence: true }
        },
        workCenter: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async startJob(companyId: string, jobCardId: string, userId: string) {
    const job = await this.prisma.jobCard.findFirst({
      where: { id: jobCardId, companyId }
    });

    if (!job) throw new NotFoundException('Job Card not found');
    if (job.status === JobCardStatus.COMPLETED) throw new BadRequestException('Job already completed');
    if (job.status === JobCardStatus.IN_PROGRESS) return job;

    return this.prisma.jobCard.update({
      where: { id: jobCardId },
      data: {
        status: JobCardStatus.IN_PROGRESS,
        startedAt: new Date(),
        assignedTo: userId
      }
    });
  }

  async pauseJob(companyId: string, jobCardId: string, reason: string) {
    const job = await this.prisma.jobCard.findFirst({
      where: { id: jobCardId, companyId }
    });

    if (!job || job.status !== JobCardStatus.IN_PROGRESS) {
      throw new BadRequestException('Job is not in progress');
    }

    // In a real app, we'd calculate actual hours spent so far
    return this.prisma.jobCard.update({
      where: { id: jobCardId },
      data: {
        status: JobCardStatus.PAUSED,
        notes: job.notes ? `${job.notes}\nPaused: ${reason}` : `Paused: ${reason}`
      }
    });
  }

  async completeJob(companyId: string, jobCardId: string, actualHours: number) {
    const job = await this.prisma.jobCard.findFirst({
      where: { id: jobCardId, companyId }
    });

    if (!job) throw new NotFoundException('Job Card not found');

    const updatedJob = await this.prisma.jobCard.update({
      where: { id: jobCardId },
      data: {
        status: JobCardStatus.COMPLETED,
        completedAt: new Date(),
        actualHours: actualHours
      }
    });

    // Check if all job cards for this operation/work order are done
    // and update WorkOrderOperation status
    await this.updateOperationStatus(job.operationId);

    return updatedJob;
  }

  private async updateOperationStatus(operationId: string) {
    const pendingJobs = await this.prisma.jobCard.count({
      where: { operationId, status: { not: JobCardStatus.COMPLETED } }
    });

    if (pendingJobs === 0) {
      await this.prisma.workOrderOperation.update({
        where: { id: operationId },
        data: { status: 'COMPLETED' }
      });
    } else {
      await this.prisma.workOrderOperation.update({
        where: { id: operationId },
        data: { status: 'IN_PROGRESS' }
      });
    }
  }

  async logDowntime(companyId: string, userId: string, data: { jobCardId: string; reasonCode: string; description?: string; startTime: Date }) {
    return this.prisma.downtimeLog.create({
      data: {
        companyId,
        loggedBy: userId,
        ...data
      }
    });
  }

  async getShopFloorStats(companyId: string) {
    const [activeJobs, completedToday] = await Promise.all([
      this.prisma.jobCard.count({ where: { companyId, status: JobCardStatus.IN_PROGRESS } }),
      this.prisma.jobCard.count({ 
        where: { 
          companyId, 
          status: JobCardStatus.COMPLETED,
          completedAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
        } 
      })
    ]);

    return { activeJobs, completedToday };
  }
}
