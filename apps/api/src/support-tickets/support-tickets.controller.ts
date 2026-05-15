import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SupportTicketsService } from './support-tickets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Support Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support-tickets')
export class SupportTicketsController {
  constructor(private readonly service: SupportTicketsService) {}

  @Post()
  create(@CurrentUser('companyId') cid: string, @CurrentUser('customerId') custId: string, @Body() data: any) {
    // If logged in as customer, use their customerId. If admin, customerId should be in body.
    const finalCustId = custId || data.customerId;
    return this.service.create(cid, finalCustId, data);
  }

  @Get()
  findAll(@CurrentUser('companyId') cid: string, @CurrentUser('customerId') custId: string) {
    return this.service.findAll(cid, custId);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') cid: string, @Param('id') id: string) {
    return this.service.findOne(cid, id);
  }

  @Put(':id/status')
  updateStatus(@CurrentUser('companyId') cid: string, @Param('id') id: string, @Body('status') status: string) {
    return this.service.updateStatus(cid, id, status);
  }
}
