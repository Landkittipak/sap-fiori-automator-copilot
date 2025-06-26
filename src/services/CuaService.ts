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

interface CuaAgent {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

interface CuaWorkspace {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface CuaApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export class CuaService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_CUA_API_KEY || process.env.CUA_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_CUA_API_URL || process.env.CUA_API_URL || 'https://api.trycua.com';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CuaApiResponse<T>> {
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
      throw new Error(`C/ua API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getAutomations(): Promise<CuaAutomation[]> {
    try {
      const response = await this.makeRequest<{ automations: CuaAutomation[] }>('/automations');
      return response.data.automations || [];
    } catch (error) {
      console.error('Failed to fetch Cua automations:', error);
      return [];
    }
  }

  async triggerAutomation(automationId: string, inputs: Record<string, any> = {}): Promise<CuaRunResponse> {
    const response = await this.makeRequest<CuaRunResponse>(`/automations/${automationId}/run`, {
      method: 'POST',
      body: JSON.stringify({ inputs }),
    });

    return response.data;
  }

  async getRunStatus(runId: string): Promise<CuaRunResponse> {
    const response = await this.makeRequest<CuaRunResponse>(`/runs/${runId}`);
    return response.data;
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

  // Get all agents for the authenticated user
  async getAgents(): Promise<CuaAgent[]> {
    try {
      const response = await this.makeRequest<CuaAgent[]>('/agents');
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }

  // Get a specific agent by ID
  async getAgent(agentId: string): Promise<CuaAgent> {
    try {
      const response = await this.makeRequest<CuaAgent>(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  }

  // Create a new agent
  async createAgent(name: string, workspaceId?: string): Promise<CuaAgent> {
    try {
      const response = await this.makeRequest<CuaAgent>('/agents', {
        method: 'POST',
        body: JSON.stringify({
          name,
          workspace_id: workspaceId,
        }),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  // Start an agent
  async startAgent(agentId: string): Promise<CuaAgent> {
    try {
      const response = await this.makeRequest<CuaAgent>(`/agents/${agentId}/start`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      console.error('Error starting agent:', error);
      throw error;
    }
  }

  // Stop an agent
  async stopAgent(agentId: string): Promise<CuaAgent> {
    try {
      const response = await this.makeRequest<CuaAgent>(`/agents/${agentId}/stop`, {
        method: 'POST',
      });
      return response.data;
    } catch (error) {
      console.error('Error stopping agent:', error);
      throw error;
    }
  }

  // Get all workspaces
  async getWorkspaces(): Promise<CuaWorkspace[]> {
    try {
      const response = await this.makeRequest<CuaWorkspace[]>('/workspaces');
      return response.data;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  }

  // Create a new workspace
  async createWorkspace(name: string): Promise<CuaWorkspace> {
    try {
      const response = await this.makeRequest<CuaWorkspace>('/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }

  // Execute a task on an agent
  async executeTask(agentId: string, task: string, parameters?: Record<string, any>): Promise<any> {
    try {
      const response = await this.makeRequest(`/agents/${agentId}/execute`, {
        method: 'POST',
        body: JSON.stringify({
          task,
          parameters,
        }),
      });
      return response.data;
    } catch (error) {
      console.error('Error executing task:', error);
      throw error;
    }
  }

  // Get agent logs
  async getAgentLogs(agentId: string, limit: number = 100): Promise<any[]> {
    try {
      const response = await this.makeRequest<any[]>(`/agents/${agentId}/logs?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agent logs:', error);
      throw error;
    }
  }
}

export default CuaService;
