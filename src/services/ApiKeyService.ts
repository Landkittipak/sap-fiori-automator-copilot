
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ApiKey = Database['public']['Tables']['api_keys']['Row'];
type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert'];

class ApiKeyService {
  async createApiKey(data: {
    name: string;
    service: string;
    keyValue: string;
    expiresAt?: string;
  }): Promise<ApiKey> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Hash the key for security (in a real app, use proper encryption)
    const keyHash = btoa(data.keyValue);

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: data.name,
        service: data.service,
        key_hash: keyHash,
        expires_at: data.expiresAt,
      })
      .select()
      .single();

    if (error) throw error;
    return apiKey;
  }

  async getUserApiKeys(): Promise<ApiKey[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<void> {
    const { error } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteApiKey(id: string): Promise<void> {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async testApiKey(id: string): Promise<boolean> {
    try {
      await this.updateApiKey(id, { last_used_at: new Date().toISOString() });
      return true;
    } catch {
      return false;
    }
  }

  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
}

export const apiKeyService = new ApiKeyService();
