export interface DomainEvent<T = any> {
  id: string;
  tenant_id: string;
  trace_id: string;
  event_type: string;
  sequence_number: number;
  version: number;
  payload: T;
  created_at: Date;
}
