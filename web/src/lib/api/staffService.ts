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

export const staffService = {
  async getStaff() {
    const response = await fetch(`${BACKEND_URL}/api/v1/staff`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch staff');
    return response.json();
  },

  async inviteStaff(email: string, role: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/staff/invite`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ email, role }),
    });
    if (!response.ok) throw new Error('Failed to invite staff');
    return response.json();
  },

  async updateStaffRole(staffId: string, role: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/staff/${staffId}/role`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error('Failed to update staff role');
    return response.json();
  },

  async getAuditLogs() {
    const response = await fetch(`${BACKEND_URL}/api/v1/staff/audit-logs`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  }
};
