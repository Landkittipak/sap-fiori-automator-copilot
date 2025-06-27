/**
 * Real Workflow Execution Service
 * Connects to the FastAPI backend for actual browser automation
 */

interface WorkflowStep {
  id: string;
  step_type: string;
  step_order: number;
  config: Record<string, any>;
}

interface AutomationRequest {
  workflow_steps: WorkflowStep[];
  template_inputs: Record<string, string>;
  sap_fiori_url?: string;
}

interface ExecutionStatus {
  run_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_step?: number;
  total_steps: number;
  results: Record<string, any>;
  error?: string;
  started_at: string;
  completed_at?: string;
}

export class RealWorkflowExecutionService {
  private baseUrl = 'http://localhost:8000';

  async executeWorkflow(
    workflowSteps: any[],
    templateInputs: Record<string, string> = {},
    sapFioriUrl?: string
  ): Promise<string> {
    const request: AutomationRequest = {
      workflow_steps: workflowSteps.map(step => ({
        id: step.id,
        step_type: step.step_type,
        step_order: step.step_order,
        config: step.step_config
      })),
      template_inputs: templateInputs,
      sap_fiori_url: sapFioriUrl
    };

    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Execution failed: ${error}`);
    }

    const result = await response.json();
    return result.run_id;
  }

  async getExecutionStatus(runId: string): Promise<ExecutionStatus> {
    const response = await fetch(`${this.baseUrl}/status/${runId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }

    return await response.json();
  }

  async pollExecutionStatus(
    runId: string,
    onUpdate: (status: ExecutionStatus) => void,
    interval = 2000
  ): Promise<ExecutionStatus> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getExecutionStatus(runId);
          onUpdate(status);

          if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
            resolve(status);
            return;
          }

          setTimeout(poll, interval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  async cancelExecution(runId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/executions/${runId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel execution: ${response.statusText}`);
    }
  }

  async listExecutions(): Promise<ExecutionStatus[]> {
    const response = await fetch(`${this.baseUrl}/executions`);
    
    if (!response.ok) {
      throw new Error(`Failed to list executions: ${response.statusText}`);
    }

    return await response.json();
  }

  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/test-connection`, {
        method: 'POST',
      });

      if (!response.ok) {
        return { status: 'error', message: `HTTP ${response.status}: ${response.statusText}` };
      }

      return await response.json();
    } catch (error) {
      return { status: 'error', message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const realWorkflowExecutionService = new RealWorkflowExecutionService();