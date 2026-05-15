import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EnquiriesService, CreateEnquiryDto } from './enquiries.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EnquiryStatus } from '@prisma/client';

@ApiTags('Enquiries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly service: EnquiriesService) {}

  @Get()
  findAll(@CurrentUser('companyId') cid: string, @Query('status') status?: EnquiryStatus) {
    return this.service.findAll(cid, status);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') cid: string, @Param('id') id: string) {
    return this.service.findOne(cid, id);
  }

  @Post()
  create(@CurrentUser('companyId') cid: string, @CurrentUser('id') uid: string, @Body() dto: CreateEnquiryDto) {
    return this.service.create(cid, uid, dto);
  }

  @Put(':id')
  update(@CurrentUser('companyId') cid: string, @Param('id') id: string, @Body() dto: Partial<CreateEnquiryDto>) {
    return this.service.update(cid, id, dto);
  }

  @Put(':id/status')
  updateStatus(@CurrentUser('companyId') cid: string, @Param('id') id: string, @Body('status') status: EnquiryStatus) {
    return this.service.updateStatus(cid, id, status);
  }

  @Post(':id/summarize')
  summarize(@CurrentUser('companyId') cid: string, @Param('id') id: string) {
    return this.service.summarize(cid, id);
  }
}
