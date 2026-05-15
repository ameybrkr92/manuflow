import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('invoices')
  async create(@CurrentUser('companyId') companyId: string, @Body() data: any) {
    return this.financeService.createInvoice(companyId, data);
  }

  @Get('invoices')
  async findAll(@CurrentUser('companyId') companyId: string) {
    return this.financeService.getInvoices(companyId);
  }

  @Post('invoices/:id/payments')
  async recordPayment(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.financeService.recordPayment(companyId, id, amount);
  }

  @Get('dashboard')
  async getDashboard(@CurrentUser('companyId') companyId: string) {
    return this.financeService.getFinanceStats(companyId);
  }
}
