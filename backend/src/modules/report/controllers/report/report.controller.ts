import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ReportService } from '../../services/report/report.service';
import { JwtAuthGuard } from '../../../business-profile/guards/jwt-auth.guard';

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    const tenantId = req.user.tenant_id;
    return await this.reportService.getDashboardSummary(tenantId);
  }

  @Get('accounting/accounts')
  async getAccounts(@Request() req: any) {
    const tenantId = req.user.tenant_id;
    return await this.reportService.getAccountingAccounts(tenantId);
  }

  @Get('income-statement')
  async getIncomeStatement(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // tenantId from JWT user metadata
    const tenantId = req.user.tenant_id || req.user.entity_id; 
    return await this.reportService.getIncomeStatement(tenantId, startDate, endDate);
  }
}
