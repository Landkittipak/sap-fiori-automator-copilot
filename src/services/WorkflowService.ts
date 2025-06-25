
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type WorkflowStep = Database['public']['Tables']['workflow_steps']['Row'];

export interface WorkflowStepConfig {
  [key: string]: any;
  action?: string;
  selector?: string;
  value?: string;
  condition?: string;
  screenshot?: boolean;
  validation?: {
    type: string;
    rule: string;
  };
}

class WorkflowService {
  async createWorkflowStep(data: {
    templateId: string;
    stepOrder: number;
    stepType: 'action' | 'validation' | 'screenshot' | 'condition' | 'loop';
    config: WorkflowStepConfig;
  }): Promise<WorkflowStep> {
    const { data: step, error } = await supabase
      .from('workflow_steps')
      .insert({
        template_id: data.templateId,
        step_order: data.stepOrder,
        step_type: data.stepType,
        step_config: data.config as any,
      })
      .select()
      .single();

    if (error) throw error;
    return step;
  }

  async getWorkflowSteps(templateId: string): Promise<WorkflowStep[]> {
    const { data, error } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('template_id', templateId)
      .order('step_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updateWorkflowStep(id: string, updates: Partial<WorkflowStep>): Promise<void> {
    const { error } = await supabase
      .from('workflow_steps')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteWorkflowStep(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_steps')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async reorderSteps(templateId: string, stepIds: string[]): Promise<void> {
    for (let i = 0; i < stepIds.length; i++) {
      await this.updateWorkflowStep(stepIds[i], { step_order: i + 1 });
    }
  }

  generateStepCode(step: WorkflowStep): string {
    const config = step.step_config as WorkflowStepConfig;
    
    switch (step.step_type) {
      case 'action':
        return `await page.${config.action}('${config.selector}', '${config.value || ''}');`;
      
      case 'validation':
        return `await expect(page.locator('${config.selector}')).${config.validation?.rule || 'toBeVisible'}();`;
      
      case 'screenshot':
        return `await page.screenshot({ path: 'step_${step.step_order}.png' });`;
      
      case 'condition':
        return `if (await page.locator('${config.selector}').isVisible()) {\n  // Conditional logic\n}`;
      
      case 'loop':
        return `for (let i = 0; i < ${config.value || 1}; i++) {\n  // Loop logic\n}`;
      
      default:
        return '// Unknown step type';
    }
  }
}

export const workflowService = new WorkflowService();
