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

export const reportService = {
  async getDashboardSummary() {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/dashboard`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard summary');
    return response.json();
  },

  async getAccountingAccounts() {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/accounting/accounts`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  },

  async getIncomeStatement(startDate: string, endDate: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/reports/income-statement?startDate=${startDate}&endDate=${endDate}`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch income statement');
    return response.json();
  }
};
