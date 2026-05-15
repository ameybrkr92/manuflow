import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuotationsService, CreateQuotationDto, GenerateAiQuotationDto } from './quotations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { QuotationStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

class UpdateStatusDto { @IsEnum(QuotationStatus) status: QuotationStatus; }

@ApiTags('Quotations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly service: QuotationsService) {}

  @Get()
  @ApiQuery({ name: 'status', required: false, enum: QuotationStatus })
  findAll(@CurrentUser('companyId') companyId: string, @Query('status') status?: QuotationStatus) {
    return this.service.findAll(companyId, status);
  }

  @Get(':id')
  findOne(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.service.findOne(companyId, id);
  }

  @Post()
  create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateQuotationDto) {
    return this.service.create(companyId, dto);
  }

  @Post('ai-generate')
  generateAi(@CurrentUser('companyId') companyId: string, @Body() dto: GenerateAiQuotationDto) {
    return this.service.generateAiQuotation(companyId, dto);
  }

  @Put(':id/status')
  updateStatus(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.service.updateStatus(companyId, id, dto.status, userId);
  }

  @Post(':id/convert-to-order')
  convertToOrder(@CurrentUser('companyId') companyId: string, @Param('id') id: string) {
    return this.service.convertToOrder(companyId, id);
  }
}
