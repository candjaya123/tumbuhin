import { InventoryRepository } from '../repositories/inventory.repository';
import { SupabaseService } from '../../../shared/supabase.service';
import { SubscriptionTier } from '../../core/auth/tier.enum';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async uploadFile(tenantId: string, file: Express.Multer.File) {
    const client = this.supabaseService.getClient();
    const fileName = `inventory/${tenantId}/${Date.now()}-${file.originalname}`;
    
    const { data, error } = await client.storage
      .from('inventory-docs')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });
    
    if (error) throw error;

    const { data: { publicUrl } } = client.storage
      .from('inventory-docs')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }

  async getRawMaterials(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('raw_materials')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async addRawMaterial(tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('raw_materials')
      .insert({ ...data, tenant_id: tenantId });
    
    if (error) throw error;
  }

  async updateRawMaterial(id: string, tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('raw_materials')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async deleteRawMaterial(id: string, tenantId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('raw_materials')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async getProducts(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('products')
      .select(`
        *,
        product_recipes (
          raw_material_id,
          quantity_needed,
          raw_materials (
            name,
            unit,
            unit_price
          )
        )
      `)
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async createProductWithRecipe(user: any, data: any) {
    const client = this.supabaseService.getClient();
    const { p_name, p_selling_price, p_recipe, p_barcode } = data;
    const tenantId = user.tenant_id;

    if (user.tier === SubscriptionTier.FREE) {
      const { count, error: countError } = await client
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);
      
      if (countError) throw countError;
      if (count && count >= 150) {
        throw new ForbiddenException('Limit 150 produk tercapai untuk Tier FREE. Silakan upgrade ke Tier BUSINESS.');
      }
    }
    
    const { data: result, error } = await client.rpc('create_product_with_recipe', {
      p_name,
      p_selling_price,
      p_recipe,
      p_barcode,
      // Note: The RPC might need tenant_id if it's not handled by RLS or the function itself
    });
    
    if (error) throw error;
    return result;
  }

  async updateProductWithRecipe(productId: string, tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { p_name, p_selling_price, p_recipe, p_barcode } = data;
    
    const { error } = await client.rpc('update_product_with_recipe', {
      p_product_id: productId,
      p_name,
      p_selling_price,
      p_recipe,
      p_barcode
    });
    
    if (error) throw error;
  }

  async deleteProduct(id: string, tenantId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async getBills(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('bills')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async addBill(tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('bills')
      .insert({ ...data, tenant_id: tenantId });
    
    if (error) throw error;
  }

  async updateBill(id: string, tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('bills')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async deleteBill(id: string, tenantId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('bills')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async getAssets(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('assets')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async addAsset(tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('assets')
      .insert({ ...data, tenant_id: tenantId });
    
    if (error) throw error;
  }

  async updateAsset(id: string, tenantId: string, data: any) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('assets')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }

  async deleteAsset(id: string, tenantId: string) {
    const client = this.supabaseService.getClient();
    const { error } = await client
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);
    
    if (error) throw error;
  }
}
