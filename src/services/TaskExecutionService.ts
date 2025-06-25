
export interface RunStatus {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  currentStep: string;
  progress: number;
  logs: string[];
  screenshots: string[];
  startTime: string;
  endTime?: string;
  error?: string;
}

export interface TaskSubmissionData {
  template?: string;
  templateInputs?: Record<string, string>;
  customTask?: string;
}

class TaskExecutionService {
  private runs: Map<string, RunStatus> = new Map();
  private runCallbacks: Map<string, (status: RunStatus) => void> = new Map();

  async executeTask(taskData: TaskSubmissionData): Promise<string> {
    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const initialStatus: RunStatus = {
      id: runId,
      status: 'queued',
      currentStep: 'Initializing task...',
      progress: 0,
      logs: ['Task queued for execution'],
      screenshots: [],
      startTime: new Date().toISOString(),
    };

    this.runs.set(runId, initialStatus);
    this.notifyStatusChange(runId);

    // Start execution asynchronously
    this.startExecution(runId, taskData);

    return runId;
  }

  private async startExecution(runId: string, taskData: TaskSubmissionData) {
    const status = this.runs.get(runId);
    if (!status) return;

    try {
      // Update to running
      status.status = 'running';
      status.currentStep = 'Opening SAP Fiori launchpad...';
      status.progress = 10;
      status.logs.push('Starting browser automation');
      this.notifyStatusChange(runId);

      await this.simulateDelay(2000);

      // Generate execution steps based on template or custom task
      const steps = this.generateExecutionSteps(taskData);
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        status.currentStep = step.description;
        status.progress = 10 + ((i + 1) / steps.length) * 80;
        status.logs.push(step.description);
        status.screenshots.push(`step_${i + 1}.png`);
        
        this.notifyStatusChange(runId);
        
        // Simulate step execution time
        await this.simulateDelay(step.duration);
        
        // Simulate potential failure
        if (step.canFail && Math.random() < 0.1) {
          throw new Error(step.errorMessage || 'Step execution failed');
        }
      }

      // Completion
      status.status = 'completed';
      status.currentStep = 'Task completed successfully';
      status.progress = 100;
      status.endTime = new Date().toISOString();
      status.logs.push('Task execution completed successfully');
      
      this.notifyStatusChange(runId);
      
    } catch (error) {
      status.status = 'failed';
      status.currentStep = 'Task failed';
      status.progress = 100;
      status.endTime = new Date().toISOString();
      status.error = error instanceof Error ? error.message : 'Unknown error';
      status.logs.push(`Error: ${status.error}`);
      
      this.notifyStatusChange(runId);
    }
  }

  private generateExecutionSteps(taskData: TaskSubmissionData) {
    const baseSteps = [
      { description: 'Navigating to SAP Fiori home page', duration: 1500, canFail: false },
      { description: 'Authenticating user session', duration: 1000, canFail: true, errorMessage: 'Authentication failed' },
    ];

    if (taskData.template === 'stock-transfer') {
      return [
        ...baseSteps,
        { description: 'Opening Stock Transfer application', duration: 2000, canFail: false },
        { description: `Entering material code: ${taskData.templateInputs?.material || 'N/A'}`, duration: 1000, canFail: false },
        { description: `Setting quantity to: ${taskData.templateInputs?.qty || 'N/A'}`, duration: 800, canFail: false },
        { description: `Selecting source plant: ${taskData.templateInputs?.from_plant || 'N/A'}`, duration: 1000, canFail: false },
        { description: `Selecting destination plant: ${taskData.templateInputs?.to_plant || 'N/A'}`, duration: 1000, canFail: false },
        { description: 'Validating transfer details', duration: 1500, canFail: true, errorMessage: 'Validation failed: Insufficient stock' },
        { description: 'Executing stock transfer', duration: 2000, canFail: true, errorMessage: 'Transfer execution failed' },
        { description: 'Confirming transfer completion', duration: 1000, canFail: false },
      ];
    } else if (taskData.template === 'lead-time') {
      return [
        ...baseSteps,
        { description: 'Opening Material Master application', duration: 2000, canFail: false },
        { description: `Searching for material: ${taskData.templateInputs?.material || 'N/A'}`, duration: 1500, canFail: true, errorMessage: 'Material not found' },
        { description: 'Navigating to MRP2 tab', duration: 1000, canFail: false },
        { description: `Updating lead time to: ${taskData.templateInputs?.new_days || 'N/A'} days`, duration: 1500, canFail: false },
        { description: 'Saving material master changes', duration: 2000, canFail: true, errorMessage: 'Save operation failed' },
      ];
    } else if (taskData.template === 'stock-check') {
      return [
        ...baseSteps,
        { description: 'Opening Stock Overview application', duration: 2000, canFail: false },
        { description: `Looking up material: ${taskData.templateInputs?.material || 'N/A'}`, duration: 1500, canFail: true, errorMessage: 'Material not found in system' },
        { description: 'Retrieving current stock levels', duration: 1000, canFail: false },
        { description: 'Taking screenshot of stock information', duration: 500, canFail: false },
      ];
    } else {
      // Custom task
      return [
        ...baseSteps,
        { description: 'Processing custom automation request', duration: 3000, canFail: true, errorMessage: 'Custom task execution failed' },
        { description: 'Completing requested operations', duration: 2000, canFail: false },
      ];
    }
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private notifyStatusChange(runId: string) {
    const status = this.runs.get(runId);
    const callback = this.runCallbacks.get(runId);
    if (status && callback) {
      callback(status);
    }
  }

  getRunStatus(runId: string): RunStatus | undefined {
    return this.runs.get(runId);
  }

  subscribeToRun(runId: string, callback: (status: RunStatus) => void) {
    this.runCallbacks.set(runId, callback);
  }

  unsubscribeFromRun(runId: string) {
    this.runCallbacks.delete(runId);
  }

  getAllRuns(): RunStatus[] {
    return Array.from(this.runs.values()).sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }
}

export const taskExecutionService = new TaskExecutionService();
