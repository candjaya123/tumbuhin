import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class OrderService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Purchase Order (PO)
  async getPurchaseOrders(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('purchase_orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createPurchaseOrder(tenantId: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { vendor_name, reference_number, total_amount, status } = payload;

    const { data, error } = await client
      .from('purchase_orders')
      .insert({
        tenant_id: tenantId,
        vendor_name,
        reference_number,
        total_amount,
        status: status || 'draft'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Sales Order (SO)
  async getSalesOrders(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('sales_orders')
      .select(`
        *,
        customers (name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createSalesOrder(tenantId: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { customer_id, reference_number, total_amount, status } = payload;

    const { data, error } = await client
      .from('sales_orders')
      .insert({
        tenant_id: tenantId,
        customer_id,
        reference_number,
        total_amount,
        status: status || 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
