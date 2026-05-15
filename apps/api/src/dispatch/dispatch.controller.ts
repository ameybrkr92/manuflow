import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dispatch')
@UseGuards(JwtAuthGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post()
  async create(@CurrentUser('companyId') companyId: string, @Body() data: any) {
    return this.dispatchService.createDispatchAdvice(companyId, data);
  }

  @Get()
  async findAll(@CurrentUser('companyId') companyId: string) {
    return this.dispatchService.getDispatchAdvices(companyId);
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('data') data: any,
  ) {
    return this.dispatchService.updateDispatchStatus(companyId, id, status, data);
  }

  @Get('dashboard')
  async getDashboard(@CurrentUser('companyId') companyId: string) {
    return this.dispatchService.getDispatchStats(companyId);
  }
}
