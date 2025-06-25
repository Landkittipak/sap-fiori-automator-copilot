
import { supabase } from '@/integrations/supabase/client';

interface CuaAutomation {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

interface CuaRunResponse {
  id: string;
  status: 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export class CuaService {
  private baseUrl = 'https://api.trycua.com/v1';
  private apiKey: string | null = null;

  constructor() {
    this.initializeApiKey();
  }

  private async initializeApiKey() {
    try {
      const { data } = await supabase.functions.invoke('get-secret', {
        body: { name: 'CUA_API_KEY' }
      });
      this.apiKey = data?.value;
    } catch (error) {
      console.warn('Failed to load Cua API key:', error);
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.apiKey) {
      await this.initializeApiKey();
    }

    if (!this.apiKey) {
      throw new Error('Cua API key not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cua API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getAutomations(): Promise<CuaAutomation[]> {
    try {
      const data = await this.makeRequest('/automations');
      return data.automations || [];
    } catch (error) {
      console.error('Failed to fetch Cua automations:', error);
      return [];
    }
  }

  async triggerAutomation(automationId: string, inputs: Record<string, any> = {}): Promise<CuaRunResponse> {
    const data = await this.makeRequest(`/automations/${automationId}/run`, {
      method: 'POST',
      body: JSON.stringify({ inputs }),
    });

    return {
      id: data.runId || data.id,
      status: data.status || 'running',
      result: data.result,
      error: data.error,
    };
  }

  async getRunStatus(runId: string): Promise<CuaRunResponse> {
    const data = await this.makeRequest(`/runs/${runId}`);
    
    return {
      id: data.id,
      status: data.status,
      result: data.result,
      error: data.error,
    };
  }

  async waitForCompletion(runId: string, maxWaitTime = 60000): Promise<CuaRunResponse> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getRunStatus(runId);
      
      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Cua automation timeout');
  }
}

export const cuaService = new CuaService();
