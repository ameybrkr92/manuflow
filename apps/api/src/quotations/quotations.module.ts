import { Module } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { AiModule } from '../ai/ai.module';

@Module({ imports: [AiModule], controllers: [QuotationsController], providers: [QuotationsService] })
export class QuotationsModule {}
