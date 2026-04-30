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

export const adminService = {
  async getTenants() {
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/tenants`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch tenants');
    return response.json();
  },

  async updateTenant(id: string, updates: any) {
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/tenants/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update tenant');
    return response.json();
  }
};
