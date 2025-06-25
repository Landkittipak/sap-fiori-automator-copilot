
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type SapConnection = Database['public']['Tables']['sap_connections']['Row'];

class SapConnectionService {
  async createConnection(data: {
    name: string;
    systemId: string;
    host: string;
    client: string;
    config?: Record<string, any>;
  }): Promise<SapConnection> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: connection, error } = await supabase
      .from('sap_connections')
      .insert({
        user_id: user.id,
        name: data.name,
        system_id: data.systemId,
        host: data.host,
        client: data.client,
        connection_config: data.config || {},
      })
      .select()
      .single();

    if (error) throw error;
    return connection;
  }

  async getUserConnections(): Promise<SapConnection[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('sap_connections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async testConnection(id: string): Promise<boolean> {
    try {
      // Simulate SAP connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await supabase
        .from('sap_connections')
        .update({ 
          last_tested_at: new Date().toISOString(),
          is_active: true 
        })
        .eq('id', id);

      return true;
    } catch {
      await supabase
        .from('sap_connections')
        .update({ is_active: false })
        .eq('id', id);
      
      return false;
    }
  }

  async updateConnection(id: string, updates: Partial<SapConnection>): Promise<void> {
    const { error } = await supabase
      .from('sap_connections')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteConnection(id: string): Promise<void> {
    const { error } = await supabase
      .from('sap_connections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
}

export const sapConnectionService = new SapConnectionService();
