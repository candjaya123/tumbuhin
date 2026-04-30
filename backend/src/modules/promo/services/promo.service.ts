import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class PromoService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getPromotions(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('promotions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createPromotion(tenantId: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('promotions')
      .insert({
        ...payload,
        tenant_id: tenantId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePromotion(id: string, tenantId: string, payload: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('promotions')
      .update(payload)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deletePromotion(id: string, tenantId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('promotions')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
    return { success: true };
  }

  async applyPromotions(tenantId: string, items: any[], promoCode?: string) {
    const activePromotions = await this.getPromotions(tenantId);
    let totalDiscount = 0;
    const appliedPromos = [];

    for (const promo of activePromotions) {
      if (!promo.is_active) continue;
      
      const now = new Date();
      if (promo.starts_at && new Date(promo.starts_at) > now) continue;
      if (promo.ends_at && new Date(promo.ends_at) < now) continue;

      if (promo.type === 'discount_percentage') {
        const rules = promo.rules as any;
        const discountRate = rules.percentage || 0;
        const eligibleItems = rules.product_ids 
          ? items.filter(item => rules.product_ids.includes(item.product_id))
          : items;

        const discountAmount = eligibleItems.reduce((acc, item) => acc + (item.price * item.quantity * (discountRate / 100)), 0);
        if (discountAmount > 0) {
          totalDiscount += discountAmount;
          appliedPromos.push({ id: promo.id, name: promo.name, amount: discountAmount });
        }
      }

      if (promo.type === 'buy_x_get_y') {
        const rules = promo.rules as any;
        const { x_qty, y_qty, product_id } = rules;
        const item = items.find(i => i.product_id === product_id);
        if (item && item.quantity >= x_qty) {
          const sets = Math.floor(item.quantity / x_qty);
          const freeQty = sets * y_qty;
          const discountAmount = freeQty * item.price;
          totalDiscount += discountAmount;
          appliedPromos.push({ id: promo.id, name: promo.name, amount: discountAmount, free_qty: freeQty });
        }
      }
    }

    return {
      totalDiscount,
      appliedPromos
    };
  }
}
