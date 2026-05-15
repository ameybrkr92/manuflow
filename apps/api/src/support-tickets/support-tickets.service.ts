import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportTicketsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, customerId: string, data: { subject: string; description: string; priority?: string }) {
    return this.prisma.supportTicket.create({
      data: {
        companyId,
        customerId,
        subject: data.subject,
        description: data.description,
        priority: data.priority || 'MEDIUM',
      },
    });
  }

  async findAll(companyId: string, customerId?: string) {
    return this.prisma.supportTicket.findMany({
      where: {
        companyId,
        ...(customerId && { customerId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, companyId },
      include: { customer: { select: { name: true } } },
    });
    if (!ticket) throw new NotFoundException('Support ticket not found');
    return ticket;
  }

  async updateStatus(companyId: string, id: string, status: string) {
    await this.findOne(companyId, id);
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status },
    });
  }
}
