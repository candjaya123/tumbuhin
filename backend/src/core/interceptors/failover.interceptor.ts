import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException, ServiceUnavailableException, Logger } from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../shared/supabase.service';

@Injectable()
export class FailoverInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FailoverInterceptor.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const client = this.supabaseService.getClient();

    return from(client.from('global_settings').select('system_mode').limit(1).single()).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          this.logger.error(`Failed to fetch system mode: ${error.message}`);
          return next.handle(); // Default to normal if setting fetch fails
        }

        const mode = data?.system_mode || 'NORMAL';

        if (mode === 'EMERGENCY') {
          throw new ServiceUnavailableException('System is under emergency maintenance.');
        }

        if (mode === 'READ_ONLY' && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
          throw new ForbiddenException('System is currently in READ_ONLY mode. Mutations are blocked.');
        }

        if (mode === 'DEGRADED') {
          const isAIOurReport = request.url.includes('/ai') || request.url.includes('/reports/realtime');
          if (isAIOurReport) {
            throw new ServiceUnavailableException('AI and Real-time Reporting are disabled in DEGRADED mode.');
          }
        }

        return next.handle();
      })
    );
  }
}
