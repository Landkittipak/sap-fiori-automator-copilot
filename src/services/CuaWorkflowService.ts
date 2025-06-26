import { useToast } from '@/hooks/use-toast';

// Types
export interface CuaAgent {
  id: string;
  status: 'idle' | 'running' | 'error';
  current_task: string | null;
  created_at: string;
}

export interface CuaTask {
  task_id: string;
  task: string;
  status: 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  start_time: string;
  end_time?: string;
}

export interface WorkflowStep {
  type: 'cua' | 'api';
  task?: string;
  agent_id?: string;
  endpoint?: string;
  data?: Record<string, any>;
}

export interface Workflow {
  name: string;
  description?: string;
  steps: WorkflowStep[];
}

export interface WorkflowResult {
  workflow_id: string;
  name: string;
  steps: Array<{
    step: number;
    type: string;
    task_id?: string;
    endpoint?: string;
    status: string;
  }>;
  status: string;
}

export interface CuaStatus {
  type: string;
  agents?: number;
  active_tasks?: number;
  task_id?: string;
  result?: any;
  error?: string;
}

class CuaWorkflowService {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private statusCallbacks: ((status: CuaStatus) => void)[] = [];

  constructor() {
    this.baseUrl = import.meta.env.VITE_CUA_BACKEND_URL || 'http://localhost:8000';
  }

  // WebSocket connection for real-time updates
  connectWebSocket() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/ws`);
    
    this.ws.onopen = () => {
      console.log('🔌 Connected to CUA WebSocket');
    };

    this.ws.onmessage = (event) => {
      try {
        const status: CuaStatus = JSON.parse(event.data);
        this.statusCallbacks.forEach(callback => callback(status));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Reconnect after 5 seconds
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  // Subscribe to status updates
  onStatusUpdate(callback: (status: CuaStatus) => void) {
    this.statusCallbacks.push(callback);
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  // Agent Management
  async createAgent(agentType: string = 'macos'): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/create?agent_type=${agentType}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create agent: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.agent_id;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  async getAgents(): Promise<CuaAgent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/agents`);
      
      if (!response.ok) {
        throw new Error(`Failed to get agents: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.agents;
    } catch (error) {
      console.error('Error getting agents:', error);
      throw error;
    }
  }

  // Task Execution
  async executeTask(task: string, agentId?: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task,
          agent_id: agentId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to execute task: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.task_id;
    } catch (error) {
      console.error('Error executing task:', error);
      throw error;
    }
  }

  async getTaskStatus(taskId: string): Promise<CuaTask> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${taskId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get task status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting task status:', error);
      throw error;
    }
  }

  async getTasks(): Promise<CuaTask[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks`);
      
      if (!response.ok) {
        throw new Error(`Failed to get tasks: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.tasks;
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  // Workflow Execution
  async executeWorkflow(workflow: Workflow): Promise<WorkflowResult> {
    try {
      const response = await fetch(`${this.baseUrl}/workflows/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to execute workflow: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  // Quick Task Templates
  async executeQuickTask(taskType: string, parameters: Record<string, any> = {}): Promise<string> {
    const task = this.buildCuaTask(taskType, parameters);
    return await this.executeTask(task);
  }

  private buildCuaTask(taskType: string, parameters: Record<string, any>): string {
    const templates: Record<string, string> = {
      'sap-login': `Open Chrome and navigate to ${parameters.sapUrl || 'SAP Fiori launchpad'}. Login with username ${parameters.username || 'your credentials'} and verify successful login.`,
      
      'sap-data-entry': `Navigate to transaction ${parameters.transaction || 'MM60'}. Fill the form with the following data: ${JSON.stringify(parameters.formData || {})}. Submit the form and capture the result.`,
      
      'sap-report': `Access the ${parameters.reportName || 'Material Master'} report. Set parameters: ${JSON.stringify(parameters.parameters || {})}. Execute the report and download it to ${parameters.downloadPath || 'Desktop'}.`,
      
      'sap-navigation': `Open SAP Fiori and navigate to ${parameters.screen || 'the main menu'}. Look for ${parameters.target || 'the specified element'} and click on it.`,
      
      'file-operation': `Open the file ${parameters.filePath || 'specified file'} and ${parameters.action || 'read its contents'}. ${parameters.additionalAction || ''}`,
      
      'browser-automation': `Open Chrome and go to ${parameters.url || 'the specified URL'}. ${parameters.action || 'Perform the requested action'}.`,
      
      'custom-task': parameters.customTask || 'Perform the specified custom task'
    };

    return templates[taskType] || parameters.customTask || 'Perform the requested task';
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create singleton instance
export const cuaWorkflowService = new CuaWorkflowService();
export default CuaWorkflowService; 