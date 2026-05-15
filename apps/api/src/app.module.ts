import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { CustomersModule } from './customers/customers.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { QuotationsModule } from './quotations/quotations.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { AiModule } from './ai/ai.module';
import { BomModule } from './bom/bom.module';
import { ProductionModule } from './production/production.module';
import { ShopFloorModule } from './shop-floor/shop-floor.module';
import { QualityModule } from './quality/quality.module';
import { PurchaseModule } from './purchase/purchase.module';
import { InventoryModule } from './inventory/inventory.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { FinanceModule } from './finance/finance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SupportTicketsModule } from './support-tickets/support-tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    CustomersModule,
    EnquiriesModule,
    QuotationsModule,
    SalesOrdersModule,
    AiModule,
    BomModule,
    ProductionModule,
    ShopFloorModule,
    QualityModule,
    PurchaseModule,
    InventoryModule,
    DispatchModule,
    FinanceModule,
    AnalyticsModule,
    SupportTicketsModule,
  ],
})
export class AppModule {}
