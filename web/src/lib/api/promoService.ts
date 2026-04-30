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

export const promoService = {
  async getPromos() {
    const response = await fetch(`${BACKEND_URL}/api/v1/promo`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch promos');
    return response.json();
  },

  async createPromo(data: any) {
    const response = await fetch(`${BACKEND_URL}/api/v1/promo`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create promo');
    return response.json();
  },

  async updatePromo(id: string, data: any) {
    const response = await fetch(`${BACKEND_URL}/api/v1/promo/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update promo');
    return response.json();
  },

  async deletePromo(id: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/promo/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete promo');
    return response.json();
  }
};
