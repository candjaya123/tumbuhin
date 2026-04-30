import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SupabaseService } from '../../shared/supabase.service';
import { DomainEvent } from './domain-event.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(
    @InjectQueue('event-processor-queue') private eventQueue: Queue,
    private readonly supabaseService: SupabaseService,
  ) {}

  async emit(event: Partial<DomainEvent>): Promise<void> {
    const client = this.supabaseService.getClient();
    if (!event.tenant_id) throw new Error('tenant_id is required');
    if (!event.event_type) throw new Error('event_type is required');

    const eventId = uuidv4();
    const traceId = event.trace_id || uuidv4();
    const idempotencyKey = event.id || uuidv4(); // Use event ID as idempotency key if provided

    // 1. Get next sequence number and Save to event_log
    const { data: lastEvent, error: seqError } = await client
      .from('event_log')
      .select('sequence_number')
      .eq('tenant_id', event.tenant_id)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .single();

    const nextSequence = lastEvent ? Number(lastEvent.sequence_number) + 1 : 1;

    const domainEvent: DomainEvent = {
      id: eventId,
      tenant_id: event.tenant_id,
      trace_id: traceId,
      event_type: event.event_type,
      sequence_number: nextSequence,
      version: event.version || 1,
      payload: event.payload,
      created_at: new Date(),
    };

    const { error: insertError } = await client.from('event_log').insert({
      id: domainEvent.id,
      tenant_id: domainEvent.tenant_id,
      trace_id: domainEvent.trace_id,
      idempotency_key: idempotencyKey,
      event_type: domainEvent.event_type,
      sequence_number: domainEvent.sequence_number,
      version: domainEvent.version,
      payload: domainEvent.payload,
      created_at: domainEvent.created_at,
    });

    if (insertError) {
      this.logger.error(`Failed to log event: ${insertError.message}`);
      throw new Error(`Event logging failed: ${insertError.message}`);
    }

    // 2. Add to BullMQ for processing
    await this.eventQueue.add(domainEvent.event_type, domainEvent, {
      jobId: domainEvent.id, // For idempotency in BullMQ
    });

    this.logger.log(`Event emitted: ${domainEvent.event_type} (${domainEvent.id}) for tenant ${domainEvent.tenant_id}`);
  }
}
