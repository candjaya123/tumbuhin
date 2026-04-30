import { Injectable, NestMiddleware, ConflictException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../../shared/supabase.service';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(private readonly supabaseService: SupabaseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const key = req.headers['x-idempotency-key'];

    if (req.method === 'POST' && key) {
      const client = this.supabaseService.getClient();
      
      const { data, error } = await client
        .from('transactions')
        .select('id')
        .eq('idempotency_key', key)
        .single();

      if (data) {
        throw new ConflictException(`Duplicate request detected for key: ${key}`);
      }
    }

    next();
  }
}
