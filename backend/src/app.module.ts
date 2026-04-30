import { MiddlewareConsumer, Module, Global, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseStrategy } from './core/auth/supabase.strategy';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SupabaseService } from './shared/supabase.service';
import { TierGuard } from './core/auth/tier.guard';
import { RoleGuard } from './core/auth/role.guard';
import { SalesModule } from './modules/sales/sales.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { BusinessProfileModule } from './modules/business-profile/business-profile.module';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from './modules/ai/ai.module';
import { ReportModule } from './modules/report/report.module';
import { IdempotencyMiddleware } from './core/middlewares/idempotency.middleware';
import { CqrsModule } from '@nestjs/cqrs';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { OrderModule } from './modules/order/order.module';
import { PromoModule } from './modules/promo/promo.module';
import { InsightModule } from './modules/insight/insight.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { InventoryModule } from './modules/inventory/inventory.module';

import { LoggerModule } from 'nestjs-pino';
import { TraceIdMiddleware } from './core/middlewares/trace.middleware';

@Global()
@Module({
  imports: [
    PassportModule,
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req) => ({
          traceId: (req as any)['traceId'],
        }),
        transport: process.env.NODE_ENV !== 'production' 
          ? { target: 'pino-pretty' } 
          : undefined,
      },
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379') || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'event-processor-queue',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    }),
    CqrsModule,
    SalesModule,
    AccountingModule,
    BusinessProfileModule,
    ReportModule,
    AiModule,
    OnboardingModule,
    WarehouseModule,
    OrderModule,
    PromoModule,
    InsightModule,
    ProcurementModule,
    InventoryModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SupabaseStrategy,
    SupabaseService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard('supabase'),
    },
    {
      provide: APP_GUARD,
      useClass: TierGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [SupabaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TraceIdMiddleware)
      .forRoutes('*');
    
    consumer
      .apply(IdempotencyMiddleware)
      .forRoutes('api/v1/sales', 'api/v1/journal');
  }
}
