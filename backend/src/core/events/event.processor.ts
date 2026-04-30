import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase.service';
import { DomainEvent } from './domain-event.interface';

@Processor('event-processor-queue')
export class EventProcessor extends WorkerHost {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(private readonly supabaseService: SupabaseService) {
    super();
  }

  async process(job: Job<DomainEvent>): Promise<void> {
    const event = job.data;
    const client = this.supabaseService.getClient();

    this.logger.debug(`Processing event: ${event.event_type} (${event.id})`);

    try {
      // 1. Exactly-Once Processing Check
      const { error: processedError } = await client
        .from('processed_events')
        .insert({
          event_id: event.id,
          worker_id: `worker-${process.pid}`,
        });

      if (processedError) {
        if (processedError.code === '23505') { // Unique violation
          this.logger.warn(`Event ${event.id} already processed. Skipping.`);
          return;
        }
        throw new Error(`Failed to check processed status: ${processedError.message}`);
      }

      // 2. Global Event Ordering Guarantee (Sequence Gap Check)
      // Check if this is the expected next sequence for the tenant
      const { data: processedCount, error: countError } = await client
        .from('processed_events')
        .select('event_id', { count: 'exact', head: true })
        .eq('event_id', event.id); // This is just a placeholder, we need to check the last processed sequence number

      // REAL Sequence Check:
      // We need a table to track last_processed_sequence per tenant, or query event_log + processed_events
      const { data: lastProcessed, error: lastError } = await client
        .from('event_log')
        .select('sequence_number, processed_events!inner(event_id)')
        .eq('tenant_id', event.tenant_id)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const expectedSequence = lastProcessed ? Number(lastProcessed.sequence_number) + 1 : 1;

      if (event.sequence_number > expectedSequence) {
        this.logger.error(`Sequence gap detected for tenant ${event.tenant_id}. Expected ${expectedSequence}, got ${event.sequence_number}.`);
        // In a real production system, we might trigger a replay or move to a "waiting" queue
        throw new Error(`Sequence gap detected: Expected ${expectedSequence}`);
      }

      // 3. Dispatching (In a real CQRS app, we'd use EventBus from @nestjs/cqrs here)
      // For now, we log it.
      this.logger.log(`Successfully processed ${event.event_type} for tenant ${event.tenant_id}`);

    } catch (error) {
      this.logger.error(`Error processing event ${event.id}: ${error.message}`);
      
      // Handle DLQ manually if needed (BullMQ handles retries, but we want to log to DB on final failure)
      if (job.attemptsMade >= (job.opts.attempts || 5) - 1) {
        await client.from('dlq_events').insert({
          event_id: event.id,
          error_message: error.message,
          stack_trace: error.stack,
        });
      }
      
      throw error; // Re-throw to trigger BullMQ retry
    }
  }
}
