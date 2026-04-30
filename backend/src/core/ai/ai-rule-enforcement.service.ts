import { Injectable, Logger, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase.service';
import { z } from 'zod';

@Injectable()
export class AiRuleEnforcementService {
  private readonly logger = new Logger(AiRuleEnforcementService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async enforceRules(tenantId: string, prompt: string, schema: z.ZodSchema): Promise<any> {
    const client = this.supabaseService.getClient();

    // 1. Check AI Safe Mode Engine (Task 3.4)
    const { data: profile } = await client
      .from('profiles')
      .select('ai_operation_mode')
      .eq('tenant_id', tenantId)
      .single();

    const mode = profile?.ai_operation_mode || 'NORMAL';

    if (mode === 'LOCKED') {
      throw new ServiceUnavailableException('AI services are currently locked for this account.');
    }

    // 2. Rule Engine (Task 3.1)
    // Inject corporate rules and feedback loops
    const failureRate = await this.getAIFeedbackRate(tenantId);
    let systemInstruction = 'You are a professional ERP assistant.';
    
    if (failureRate > 0.2) { // Task 3.3
      systemInstruction += '\nPERHATIAN: Pastikan confidence > 90%. Jika ragu, DILARANG mengeluarkan |COMMAND|, gunakan |REASONING| untuk bertanya balik.';
    }

    if (mode === 'SAFE') {
      systemInstruction += '\nSAFE MODE ACTIVE: You are only allowed to provide reasoning and advice. DO NOT generate executable commands.';
    }

    // 3. Pre-Validator (Placeholder for actual content filtering)
    if (prompt.length > 2000) throw new ForbiddenException('Prompt too long');

    return {
      finalPrompt: `${systemInstruction}\n\nUser Request: ${prompt}`,
      mode,
    };
  }

  async validatePost(aiResponse: string, schema: z.ZodSchema): Promise<any> {
    try {
      const jsonStr = aiResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      return schema.parse(parsed); // Task 3.1: Zod verification
    } catch (error) {
      this.logger.error(`AI Output Validation Failed: ${error.message}`);
      throw new Error(`AI generated invalid output: ${error.message}`);
    }
  }

  private async getAIFeedbackRate(tenantId: string): Promise<number> {
    const client = this.supabaseService.getClient();
    const { count, error } = await client
      .from('ai_feedbacks')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('correction_type', 'UNDO'); // Assume UNDO means AI made a mistake

    if (error || !count) return 0;
    
    const { count: total } = await client
      .from('ai_feedbacks')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    return total ? count / total : 0;
  }
}
