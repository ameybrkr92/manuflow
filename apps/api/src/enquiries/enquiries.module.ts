import { Module } from '@nestjs/common';
import { EnquiriesController } from './enquiries.controller';
import { EnquiriesService } from './enquiries.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [EnquiriesController],
  providers: [EnquiriesService],
})
export class EnquiriesModule {}

