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

export const orderService = {
  async getOrders(type?: 'SO' | 'PO') {
    const url = new URL(`${BACKEND_URL}/api/v1/order`);
    if (type) url.searchParams.append('type', type);
    
    const response = await fetch(url.toString(), {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async getOrderById(id: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/order/${id}`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch order details');
    return response.json();
  },

  async createOrder(data: any) {
    const response = await fetch(`${BACKEND_URL}/api/v1/order`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/order/${id}/status`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order status');
    return response.json();
  }
};
