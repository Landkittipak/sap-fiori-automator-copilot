
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface WorkflowStepConfig {
  action?: string;
  selector?: string;
  value?: string;
  description?: string;
  conditionType?: string;
  expectedValue?: string;
  expectedText?: string;
  duration?: string;
  validation?: {
    rule: string;
    type: string;
  };
  [key: string]: any;
}

export interface CreateWorkflowStepParams {
  templateId: string;
  stepOrder: number;
  stepType: string;
  config: WorkflowStepConfig;
}

type WorkflowStep = Database['public']['Tables']['workflow_steps']['Row'];

export const workflowService = {
  async createWorkflowStep(params: CreateWorkflowStepParams) {
    const { data, error } = await supabase
      .from('workflow_steps')
      .insert({
        template_id: params.templateId,
        step_order: params.stepOrder,
        step_type: params.stepType,
        step_config: params.config as any,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getWorkflowSteps(templateId: string): Promise<WorkflowStep[]> {
    const { data, error } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('template_id', templateId)
      .order('step_order');

    if (error) throw error;
    return data || [];
  },

  async updateWorkflowStep(stepId: string, config: WorkflowStepConfig) {
    const { data, error } = await supabase
      .from('workflow_steps')
      .update({
        step_config: config as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteWorkflowStep(stepId: string) {
    const { error } = await supabase
      .from('workflow_steps')
      .delete()
      .eq('id', stepId);

    if (error) throw error;
  },

  async reorderSteps(templateId: string, stepIds: string[]) {
    // Update step orders based on the new array order
    const updates = stepIds.map((id, index) => ({
      id,
      step_order: index + 1,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('workflow_steps')
        .update({ step_order: update.step_order })
        .eq('id', update.id);

      if (error) throw error;
    }
  },

  generateStepCode(step: WorkflowStep): string {
    const config = step.step_config as WorkflowStepConfig;
    
    switch (step.step_type) {
      case 'action':
        if (config.action === 'click') {
          return `await page.click('${config.selector}')`;
        } else if (config.action === 'type') {
          return `await page.fill('${config.selector}', '${config.value}')`;
        } else if (config.action === 'wait') {
          return `await page.waitForTimeout(${config.value || 1000})`;
        }
        return `await page.${config.action}('${config.selector}')`;
      
      case 'validation':
        return `await expect(page.locator('${config.selector}')).${config.validation?.rule}()`;
      
      case 'condition':
        return `if (await page.locator('${config.selector}').isVisible()) { /* condition logic */ }`;
      
      case 'screenshot':
        return `await page.screenshot({ path: 'screenshot.png' })`;
      
      case 'loop':
        return `for (let i = 0; i < ${config.value || 1}; i++) { /* loop logic */ }`;
      
      default:
        return `// ${step.step_type} step`;
    }
  },
};
