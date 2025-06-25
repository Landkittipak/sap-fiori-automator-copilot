
import { supabaseTaskService, type TaskSubmissionData } from './SupabaseTaskService';

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

class DatabaseTaskExecutionService {
  private runCallbacks: Map<string, (status: RunStatus) => void> = new Map();

  async executeTask(taskData: TaskSubmissionData): Promise<string> {
    const runId = await supabaseTaskService.createTaskRun(taskData);
    
    // Start execution asynchronously
    this.startExecution(runId, taskData);

    return runId;
  }

  private async startExecution(runId: string, taskData: TaskSubmissionData) {
    try {
      // Update to running
      await supabaseTaskService.updateTaskRun(runId, {
        status: 'running',
        current_step: 'Opening SAP Fiori launchpad...',
        progress: 10,
      });

      await supabaseTaskService.addExecutionLog(runId, 2, 'Starting browser automation');

      await this.simulateDelay(2000);

      // Generate execution steps based on template or custom task
      const steps = this.generateExecutionSteps(taskData);
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await supabaseTaskService.updateTaskRun(runId, {
          current_step: step.description,
          progress: 10 + ((i + 1) / steps.length) * 80,
        });

        await supabaseTaskService.addExecutionLog(
          runId, 
          i + 3, 
          step.description, 
          `step_${i + 1}.png`
        );
        
        // Simulate step execution time
        await this.simulateDelay(step.duration);
        
        // Simulate potential failure
        if (step.canFail && Math.random() < 0.1) {
          throw new Error(step.errorMessage || 'Step execution failed');
        }
      }

      // Completion
      await supabaseTaskService.updateTaskRun(runId, {
        status: 'completed',
        current_step: 'Task completed successfully',
        progress: 100,
        end_time: new Date().toISOString(),
      });

      await supabaseTaskService.addExecutionLog(runId, steps.length + 3, 'Task execution completed successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await supabaseTaskService.updateTaskRun(runId, {
        status: 'failed',
        current_step: 'Task failed',
        progress: 100,
        end_time: new Date().toISOString(),
        error_message: errorMessage,
      });

      await supabaseTaskService.addExecutionLog(runId, 999, `Error: ${errorMessage}`);
    }
  }

  private generateExecutionSteps(taskData: TaskSubmissionData) {
    const baseSteps = [
      { description: 'Navigating to SAP Fiori home page', duration: 1500, canFail: false },
      { description: 'Authenticating user session', duration: 1000, canFail: true, errorMessage: 'Authentication failed' },
    ];

    // Safely access template_inputs as a record
    const templateInputs = taskData.template_inputs || {};

    if (taskData.template_name === 'Stock Transfer') {
      return [
        ...baseSteps,
        { description: 'Opening Stock Transfer application', duration: 2000, canFail: false },
        { description: `Entering material code: ${templateInputs.material || 'N/A'}`, duration: 1000, canFail: false },
        { description: `Setting quantity to: ${templateInputs.qty || 'N/A'}`, duration: 800, canFail: false },
        { description: `Selecting source plant: ${templateInputs.from_plant || 'N/A'}`, duration: 1000, canFail: false },
        { description: `Selecting destination plant: ${templateInputs.to_plant || 'N/A'}`, duration: 1000, canFail: false },
        { description: 'Validating transfer details', duration: 1500, canFail: true, errorMessage: 'Validation failed: Insufficient stock' },
        { description: 'Executing stock transfer', duration: 2000, canFail: true, errorMessage: 'Transfer execution failed' },
        { description: 'Confirming transfer completion', duration: 1000, canFail: false },
      ];
    } else if (taskData.template_name === 'Lead Time Update') {
      return [
        ...baseSteps,
        { description: 'Opening Material Master application', duration: 2000, canFail: false },
        { description: `Searching for material: ${templateInputs.material || 'N/A'}`, duration: 1500, canFail: true, errorMessage: 'Material not found' },
        { description: 'Navigating to MRP2 tab', duration: 1000, canFail: false },
        { description: `Updating lead time to: ${templateInputs.new_days || 'N/A'} days`, duration: 1500, canFail: false },
        { description: 'Saving material master changes', duration: 2000, canFail: true, errorMessage: 'Save operation failed' },
      ];
    } else if (taskData.template_name === 'Stock Check') {
      return [
        ...baseSteps,
        { description: 'Opening Stock Overview application', duration: 2000, canFail: false },
        { description: `Looking up material: ${templateInputs.material || 'N/A'}`, duration: 1500, canFail: true, errorMessage: 'Material not found in system' },
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

  async getRunStatus(runId: string): Promise<RunStatus | undefined> {
    const taskRun = await supabaseTaskService.getTaskRun(runId);
    if (!taskRun) return undefined;

    const logs = await supabaseTaskService.getExecutionLogs(runId);
    
    return {
      id: taskRun.id,
      status: taskRun.status,
      currentStep: taskRun.current_step,
      progress: taskRun.progress,
      logs: logs.map(log => log.message),
      screenshots: logs.filter(log => log.screenshot_url).map(log => log.screenshot_url!),
      startTime: taskRun.start_time,
      endTime: taskRun.end_time,
      error: taskRun.error_message,
    };
  }

  subscribeToRun(runId: string, callback: (status: RunStatus) => void) {
    this.runCallbacks.set(runId, callback);

    // Subscribe to real-time updates
    const subscription = supabaseTaskService.subscribeToTaskRun(runId, async (taskRun) => {
      const status = await this.getRunStatus(runId);
      if (status) {
        callback(status);
      }
    });

    return subscription;
  }

  unsubscribeFromRun(runId: string) {
    this.runCallbacks.delete(runId);
  }

  async getAllRuns(): Promise<RunStatus[]> {
    const taskRuns = await supabaseTaskService.getUserTaskRuns();
    
    const runStatuses = await Promise.all(
      taskRuns.map(async (taskRun) => {
        const logs = await supabaseTaskService.getExecutionLogs(taskRun.id);
        
        return {
          id: taskRun.id,
          status: taskRun.status,
          currentStep: taskRun.current_step,
          progress: taskRun.progress,
          logs: logs.map(log => log.message),
          screenshots: logs.filter(log => log.screenshot_url).map(log => log.screenshot_url!),
          startTime: taskRun.start_time,
          endTime: taskRun.end_time,
          error: taskRun.error_message,
        } as RunStatus;
      })
    );

    return runStatuses.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }
}

export const databaseTaskExecutionService = new DatabaseTaskExecutionService();
