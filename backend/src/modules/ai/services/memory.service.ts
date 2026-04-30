import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Menyimpan insight atau pola bisnis yang ditemukan AI
   */
  async saveBusinessInsight(tenantId: string, type: string, key: string, data: any, score: number = 0.5) {
    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('business_memory')
      .upsert({
        tenant_id: tenantId,
        memory_type: type,
        context_key: key,
        memory_data: data,
        importance_score: score,
        last_updated: new Date().toISOString()
      }, { onConflict: 'tenant_id,context_key' });

    if (error) {
      this.logger.error(`Failed to save business memory: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mengambil memori relevan untuk konteks RAG
   */
  async getRelevantMemories(tenantId: string, limit: number = 5) {
    const client = this.supabaseService.getClient();
    
    const { data, error } = await client
      .from('business_memory')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('importance_score', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data;
  }
}
