
import { supabaseTaskService, type TaskSubmissionData } from './SupabaseTaskService';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedRunStatus {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  currentStep: string;
  progress: number;
  logs: string[];
  screenshots: string[];
  validationResults: Record<string, any>;
  executionMetadata: Record<string, any>;
  startTime: string;
  endTime?: string;
  error?: string;
  sapSystem?: string;
}

class EnhancedDatabaseTaskExecutionService {
  async executeTask(taskData: TaskSubmissionData & { 
    sapSystem?: string;
    screenshotConfig?: Record<string, any>;
    validationRules?: any[];
  }): Promise<string> {
    const runId = await supabaseTaskService.createTaskRun(taskData);
    
    // Start enhanced execution
    this.startEnhancedExecution(runId, taskData);
    return runId;
  }

  private async startEnhancedExecution(runId: string, taskData: any) {
    try {
      await supabaseTaskService.updateTaskRun(runId, {
        status: 'running',
        current_step: 'Initializing enhanced automation...',
        progress: 5,
        // Note: These fields will be added when the database types are updated
        // sap_system: taskData.sapSystem,
        // execution_metadata: {
        //   startedAt: new Date().toISOString(),
        //   automationType: taskData.template_name ? 'template' : 'custom',
        //   features: ['screenshots', 'validation', 'enhanced_logging']
        // }
      });

      await this.addEnhancedLog(runId, 1, 'Starting enhanced automation execution', 'info');

      // Enhanced execution steps with screenshots and validation
      const steps = this.generateEnhancedSteps(taskData);
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        await supabaseTaskService.updateTaskRun(runId, {
          current_step: step.description,
          progress: 10 + ((i + 1) / steps.length) * 80,
        });

        // Take screenshot if configured
        if (step.takeScreenshot) {
          const screenshotUrl = await this.captureScreenshot(runId, i + 1);
          await this.addEnhancedLog(
            runId, 
            i + 3, 
            `Screenshot captured: ${step.description}`, 
            'screenshot',
            { screenshotUrl, stepType: step.type }
          );
          
          // Update screenshots array
          await this.updateScreenshots(runId, screenshotUrl);
        }

        // Perform validation if specified
        if (step.validation) {
          const validationResult = await this.performValidation(step.validation);
          await this.addEnhancedLog(
            runId,
            i + 3,
            `Validation ${validationResult.success ? 'passed' : 'failed'}: ${step.description}`,
            validationResult.success ? 'info' : 'warning',
            { validation: validationResult }
          );
          
          // Update validation results
          await this.updateValidationResults(runId, step.validation.name, validationResult);
        }

        await this.addEnhancedLog(runId, i + 3, step.description, 'info');
        await this.simulateDelay(step.duration);

        // Enhanced error simulation with better context
        if (step.canFail && Math.random() < 0.08) {
          throw new Error(`${step.errorMessage}: ${step.context || 'Step execution failed'}`);
        }
      }

      // Completion with metadata
      const completionMetadata = {
        completedAt: new Date().toISOString(),
        totalSteps: steps.length,
        screenshotsTaken: steps.filter(s => s.takeScreenshot).length,
        validationsPerformed: steps.filter(s => s.validation).length,
      };

      await supabaseTaskService.updateTaskRun(runId, {
        status: 'completed',
        current_step: 'Automation completed successfully',
        progress: 100,
        end_time: new Date().toISOString(),
        // execution_metadata: completionMetadata,
      });

      await this.addEnhancedLog(runId, steps.length + 3, 'Enhanced automation execution completed successfully', 'info', completionMetadata);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await supabaseTaskService.updateTaskRun(runId, {
        status: 'failed',
        current_step: 'Automation failed',
        progress: 100,
        end_time: new Date().toISOString(),
        error_message: errorMessage,
        // execution_metadata: {
        //   failedAt: new Date().toISOString(),
        //   errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        // },
      });

      await this.addEnhancedLog(runId, 999, `Error: ${errorMessage}`, 'error', { 
        stack: error instanceof Error ? error.stack : undefined 
      });
    }
  }

  private async addEnhancedLog(
    runId: string, 
    stepNumber: number, 
    message: string, 
    logType: 'info' | 'warning' | 'error' | 'debug' | 'screenshot' | 'validation' = 'info',
    metadata?: Record<string, any>
  ) {
    const { error } = await supabase
      .from('execution_logs')
      .insert([{
        run_id: runId,
        step_number: stepNumber,
        message,
        log_type: logType,
        metadata: metadata || {},
      }]);

    if (error) console.error('Failed to add enhanced log:', error);
  }

  private async captureScreenshot(runId: string, stepNumber: number): Promise<string> {
    // Simulate screenshot capture
    await this.simulateDelay(500);
    return `screenshot_${runId}_step_${stepNumber}_${Date.now()}.png`;
  }

  private async performValidation(validation: any): Promise<any> {
    // Simulate validation logic
    await this.simulateDelay(300);
    
    const success = Math.random() > 0.1; // 90% success rate
    return {
      success,
      rule: validation.rule,
      expected: validation.expected,
      actual: success ? validation.expected : 'Different value',
      timestamp: new Date().toISOString(),
    };
  }

  private async updateScreenshots(runId: string, screenshotUrl: string) {
    const currentRun = await supabaseTaskService.getTaskRun(runId);
    if (!currentRun) return;

    // Note: These fields will work when database types are updated
    // const screenshots = Array.isArray(currentRun.screenshots) ? currentRun.screenshots : [];
    // screenshots.push(screenshotUrl);
    // await supabaseTaskService.updateTaskRun(runId, { screenshots });
  }

  private async updateValidationResults(runId: string, validationName: string, result: any) {
    const currentRun = await supabaseTaskService.getTaskRun(runId);
    if (!currentRun) return;

    // Note: These fields will work when database types are updated
    // const validationResults = typeof currentRun.validation_results === 'object' 
    //   ? currentRun.validation_results || {} 
    //   : {};
    // validationResults[validationName] = result;
    // await supabaseTaskService.updateTaskRun(runId, { validation_results: validationResults });
  }

  private generateEnhancedSteps(taskData: any) {
    const baseSteps = [
      { 
        description: 'Connecting to SAP system', 
        duration: 2000, 
        canFail: true, 
        errorMessage: 'SAP connection failed',
        context: 'Network connectivity or credentials issue',
        takeScreenshot: true,
        type: 'connection'
      },
      { 
        description: 'Authenticating user session', 
        duration: 1500, 
        canFail: true, 
        errorMessage: 'Authentication failed',
        context: 'Invalid credentials or session timeout',
        takeScreenshot: true,
        validation: {
          name: 'auth_validation',
          rule: 'user_authenticated',
          expected: true
        },
        type: 'authentication'
      },
    ];

    const templateInputs = taskData.template_inputs || {};

    if (taskData.template_name === 'Stock Transfer') {
      return [
        ...baseSteps,
        { 
          description: 'Opening Stock Transfer application (MB1B)', 
          duration: 2500, 
          canFail: false,
          takeScreenshot: true,
          type: 'navigation'
        },
        { 
          description: `Entering material code: ${templateInputs.material || 'N/A'}`, 
          duration: 1200, 
          canFail: false,
          validation: {
            name: 'material_validation',
            rule: 'material_exists',
            expected: templateInputs.material
          },
          type: 'input'
        },
        { 
          description: `Setting quantity to: ${templateInputs.qty || 'N/A'}`, 
          duration: 800, 
          canFail: false,
          takeScreenshot: true,
          type: 'input'
        },
        { 
          description: `Selecting source plant: ${templateInputs.from_plant || 'N/A'}`, 
          duration: 1000, 
          canFail: false,
          validation: {
            name: 'source_plant_validation',
            rule: 'plant_valid',
            expected: templateInputs.from_plant
          },
          type: 'selection'
        },
        { 
          description: `Selecting destination plant: ${templateInputs.to_plant || 'N/A'}`, 
          duration: 1000, 
          canFail: false,
          type: 'selection'
        },
        { 
          description: 'Validating stock availability', 
          duration: 2000, 
          canFail: true, 
          errorMessage: 'Insufficient stock available',
          context: 'Stock level below required quantity',
          takeScreenshot: true,
          validation: {
            name: 'stock_validation',
            rule: 'sufficient_stock',
            expected: 'sufficient'
          },
          type: 'validation'
        },
        { 
          description: 'Executing stock transfer transaction', 
          duration: 3000, 
          canFail: true, 
          errorMessage: 'Transfer execution failed',
          context: 'Transaction rollback due to system constraint',
          takeScreenshot: true,
          type: 'transaction'
        },
        { 
          description: 'Confirming transfer completion', 
          duration: 1500, 
          canFail: false,
          takeScreenshot: true,
          validation: {
            name: 'completion_validation',
            rule: 'transfer_completed',
            expected: 'success'
          },
          type: 'confirmation'
        },
      ];
    } else if (taskData.template_name === 'Lead Time Update') {
      return [
        ...baseSteps,
        { 
          description: 'Opening Material Master application (MM02)', 
          duration: 2500, 
          canFail: false,
          takeScreenshot: true,
          type: 'navigation'
        },
        { 
          description: `Searching for material: ${templateInputs.material || 'N/A'}`, 
          duration: 2000, 
          canFail: true, 
          errorMessage: 'Material not found',
          context: 'Material code does not exist in system',
          validation: {
            name: 'material_search_validation',
            rule: 'material_found',
            expected: templateInputs.material
          },
          type: 'search'
        },
        { 
          description: 'Navigating to MRP2 tab', 
          duration: 1200, 
          canFail: false,
          takeScreenshot: true,
          type: 'navigation'
        },
        { 
          description: `Updating lead time to: ${templateInputs.new_days || 'N/A'} days`, 
          duration: 1800, 
          canFail: false,
          takeScreenshot: true,
          validation: {
            name: 'leadtime_validation',
            rule: 'valid_leadtime',
            expected: templateInputs.new_days
          },
          type: 'update'
        },
        { 
          description: 'Saving material master changes', 
          duration: 2500, 
          canFail: true, 
          errorMessage: 'Save operation failed',
          context: 'Data validation error or system lock',
          takeScreenshot: true,
          type: 'save'
        },
      ];
    } else if (taskData.template_name === 'Stock Check') {
      return [
        ...baseSteps,
        { 
          description: 'Opening Stock Overview application (MMBE)', 
          duration: 2000, 
          canFail: false,
          takeScreenshot: true,
          type: 'navigation'
        },
        { 
          description: `Looking up material: ${templateInputs.material || 'N/A'}`, 
          duration: 1800, 
          canFail: true, 
          errorMessage: 'Material not found in system',
          context: 'Material does not exist or access restricted',
          validation: {
            name: 'stock_lookup_validation',
            rule: 'material_accessible',
            expected: templateInputs.material
          },
          type: 'lookup'
        },
        { 
          description: 'Retrieving current stock levels', 
          duration: 1500, 
          canFail: false,
          takeScreenshot: true,
          validation: {
            name: 'stock_levels_validation',
            rule: 'data_retrieved',
            expected: 'success'
          },
          type: 'retrieval'
        },
        { 
          description: 'Capturing comprehensive stock information', 
          duration: 800, 
          canFail: false,
          takeScreenshot: true,
          type: 'capture'
        },
      ];
    } else {
      return [
        ...baseSteps,
        { 
          description: 'Processing custom automation request', 
          duration: 3500, 
          canFail: true, 
          errorMessage: 'Custom task execution failed',
          context: 'Unsupported operation or system limitation',
          takeScreenshot: true,
          validation: {
            name: 'custom_validation',
            rule: 'operation_completed',
            expected: 'success'
          },
          type: 'custom'
        },
        { 
          description: 'Completing requested operations', 
          duration: 2000, 
          canFail: false,
          takeScreenshot: true,
          type: 'completion'
        },
      ];
    }
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getEnhancedRunStatus(runId: string): Promise<EnhancedRunStatus | undefined> {
    const taskRun = await supabaseTaskService.getTaskRun(runId);
    if (!taskRun) return undefined;

    const logs = await supabaseTaskService.getExecutionLogs(runId);
    
    return {
      id: taskRun.id,
      status: taskRun.status,
      currentStep: taskRun.current_step,
      progress: taskRun.progress,
      logs: logs.map(log => log.message),
      screenshots: [], // Will be populated when database types are updated
      validationResults: {}, // Will be populated when database types are updated
      executionMetadata: {}, // Will be populated when database types are updated
      startTime: taskRun.start_time,
      endTime: taskRun.end_time,
      error: taskRun.error_message,
      sapSystem: undefined, // Will be populated when database types are updated
    };
  }
}

export const enhancedDatabaseTaskExecutionService = new EnhancedDatabaseTaskExecutionService();
