import { Module } from '@nestjs/common';
import { AggregationService } from './services/aggregation.service';
import { RuleEngineService } from './services/rule-engine.service';

@Module({
  providers: [AggregationService, RuleEngineService],
  exports: [AggregationService, RuleEngineService],
})
export class InsightModule {}
