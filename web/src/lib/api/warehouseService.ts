import { createClient } from '../supabase/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getHeaders = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session found');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
};

export const warehouseService = {
  async getWarehouses() {
    const response = await fetch(`${BACKEND_URL}/api/v1/warehouse`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch warehouses');
    return response.json();
  },

  async createWarehouse(data: any) {
    const response = await fetch(`${BACKEND_URL}/api/v1/warehouse`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create warehouse');
    return response.json();
  },

  async updateWarehouse(id: string, data: any) {
    const response = await fetch(`${BACKEND_URL}/api/v1/warehouse/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update warehouse');
    return response.json();
  },

  async deleteWarehouse(id: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/warehouse/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete warehouse');
    return response.json();
  },

  async transferStock(data: { from_id: string; to_id: string; product_id: string; quantity: number; notes?: string }) {
    const response = await fetch(`${BACKEND_URL}/api/v1/warehouse/transfer`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to transfer stock');
    return response.json();
  },

  async getStockCard(productId: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/warehouse/stock-card/${productId}`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch stock card');
    return response.json();
  }
};
