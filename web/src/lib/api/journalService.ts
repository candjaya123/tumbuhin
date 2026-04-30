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

export const journalService = {
  async getDrafts() {
    const response = await fetch(`${BACKEND_URL}/api/v1/journal/drafts`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch drafts');
    return response.json();
  },

  async approveDraft(id: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/journal/approve-draft/${id}`, {
      method: 'POST',
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to approve draft');
    return response.json();
  }
};
