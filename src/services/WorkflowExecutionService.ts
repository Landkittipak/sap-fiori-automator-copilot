
import { cuaService } from './CuaService';
import { workflowService, type WorkflowStepConfig } from './WorkflowService';

export interface ExecutionContext {
  templateInputs: Record<string, string>;
  stepResults: Record<string, any>;
  runId: string;
}

export class WorkflowExecutionService {
  async executeStep(
    stepType: string, 
    config: WorkflowStepConfig, 
    context: ExecutionContext
  ): Promise<any> {
    console.log(`Executing step: ${stepType}`, config);

    switch (stepType) {
      case 'cua_automation':
        return this.executeCuaAutomation(config, context);
      
      case 'action':
        return this.executeAction(config, context);
      
      case 'validation':
        return this.executeValidation(config, context);
      
      case 'delay':
        return this.executeDelay(config, context);
      
      default:
        throw new Error(`Unknown step type: ${stepType}`);
    }
  }

  private async executeCuaAutomation(config: WorkflowStepConfig, context: ExecutionContext) {
    if (!config.automationId) {
      throw new Error('No Cua automation ID specified');
    }

    // Replace template variables in inputs
    const processedInputs = this.replaceTemplateVariables(config.inputs || {}, context);

    console.log(`Triggering Cua automation: ${config.automationId}`, processedInputs);

    const runResult = await cuaService.triggerAutomation(config.automationId, processedInputs);

    if (config.waitForCompletion) {
      console.log(`Waiting for Cua automation completion: ${runResult.id}`);
      const finalResult = await cuaService.waitForCompletion(runResult.id);
      
      if (finalResult.status === 'failed') {
        throw new Error(`Cua automation failed: ${finalResult.error}`);
      }
      
      return finalResult;
    }

    return runResult;
  }

  private async executeAction(config: WorkflowStepConfig, context: ExecutionContext) {
    // Simulate action execution
    console.log(`Executing action: ${config.action} on ${config.selector}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      action: config.action,
      selector: config.selector,
      value: config.value,
      success: true
    };
  }

  private async executeValidation(config: WorkflowStepConfig, context: ExecutionContext) {
    // Simulate validation
    console.log(`Executing validation: ${config.validation?.rule} on ${config.selector}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      validation: config.validation?.rule,
      selector: config.selector,
      passed: true
    };
  }

  private async executeDelay(config: WorkflowStepConfig, context: ExecutionContext) {
    const duration = parseInt(config.duration || '1000');
    console.log(`Executing delay: ${duration}ms`);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    return { duration };
  }

  private replaceTemplateVariables(inputs: any, context: ExecutionContext): any {
    if (typeof inputs === 'string') {
      let result = inputs;
      
      // Replace template input variables
      Object.entries(context.templateInputs).forEach(([key, value]) => {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
      
      return result;
    }
    
    if (typeof inputs === 'object' && inputs !== null) {
      const result: any = Array.isArray(inputs) ? [] : {};
      
      for (const [key, value] of Object.entries(inputs)) {
        result[key] = this.replaceTemplateVariables(value, context);
      }
      
      return result;
    }
    
    return inputs;
  }
}

export const workflowExecutionService = new WorkflowExecutionService();
