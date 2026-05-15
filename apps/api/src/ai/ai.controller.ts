import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional, IsArray } from 'class-validator';

class AiQueryDto {
  @IsString() question: string;
  @IsOptional() @IsArray() conversationHistory?: Array<{ role: string; content: string }>;
}

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('query')
  async query(@CurrentUser('companyId') companyId: string, @Body() dto: AiQueryDto) {
    const [openOrders, pendingInvoices, openNCRs, lowStock] = await Promise.all([
      this.prisma.salesOrder.count({ where: { companyId, status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
      this.prisma.invoice.findMany({
        where: { companyId, status: { in: ['SENT', 'OVERDUE'] } },
        select: { invoiceNo: true, totalAmount: true, paidAmount: true, dueDate: true },
        take: 10,
      }),
      this.prisma.nCR.count({ where: { companyId, status: { not: 'CLOSED' } } }),
      this.prisma.materialMaster.findMany({
        where: { companyId, currentStock: { lte: this.prisma.materialMaster.fields.reorderLevel } },
        select: { partNo: true, description: true, currentStock: true, reorderLevel: true },
        take: 10,
      }),
    ]);

    const answer = await this.aiService.answerQuery({
      companyId,
      question: dto.question,
      conversationHistory: dto.conversationHistory,
      data: { openOrders, pendingInvoices, openNCRs, lowStockItems: lowStock },
    });

    return { answer };
  }
}
