import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from '../../../core/ai/gemini.provider';
import { AiRuleEnforcementService } from '../../../core/ai/ai-rule-enforcement.service';
import { SupabaseService } from '../../../shared/supabase.service';
import { z } from 'zod';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly gemini: GeminiProvider,
    private readonly ruleEnforcement: AiRuleEnforcementService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async processRequest(tenantId: string, prompt: string, schema: z.ZodSchema) {
    const client = this.supabaseService.getClient();

    // 1. Pre-Processing & Rule Enforcement
    const { finalPrompt, mode } = await this.ruleEnforcement.enforceRules(tenantId, prompt, schema);

    // 2. Context Snapshot (Task 3.2: AI Decision Trace)
    const { data: feedback, error: logError } = await client
      .from('ai_feedbacks')
      .insert({
        tenant_id: tenantId,
        original_prompt: prompt,
        ai_reasoning: 'SNAPSHOT_TAKEN', // In a real system, we'd log more context here
        prompt_version: 'v1.0-erp-assistant',
      })
      .select()
      .single();

    if (logError) this.logger.error(`Failed to log context snapshot: ${logError.message}`);

    // 3. AI Execution
    // Note: Assuming GeminiProvider is updated to handle raw prompts too
    // For now, let's assume we call a generic method on gemini
    const aiOutput = await this.gemini.extractReceipt(Buffer.from([]), 'text/plain'); // Mocking for now

    // 4. Post-Validation
    const validatedData = await this.ruleEnforcement.validatePost(JSON.stringify(aiOutput), schema);

    // 5. Update feedback with execution result
    if (feedback) {
      await client
        .from('ai_feedbacks')
        .update({ executed_command: validatedData })
        .eq('id', feedback.id);
    }

    return {
      data: validatedData,
      traceId: feedback?.id,
    };
  }
}
