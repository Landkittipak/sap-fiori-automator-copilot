
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface DatabaseTaskRun {
  id: string;
  user_id: string;
  template_id?: string;
  template_name?: string;
  template_inputs?: Json;
  custom_task?: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  current_step: string;
  progress: number;
  error_message?: string;
  start_time: string;
  end_time?: string;
}

export interface DatabaseExecutionLog {
  id: string;
  run_id: string;
  step_number: number;
  message: string;
  screenshot_url?: string;
  timestamp: string;
}

export interface TaskSubmissionData {
  template_id?: string;
  template_name?: string;
  template_inputs?: Record<string, string>;
  custom_task?: string;
}

class SupabaseTaskService {
  async createTaskRun(taskData: TaskSubmissionData): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { error } = await supabase
      .from('task_runs')
      .insert([{
        id: runId,
        user_id: user.id,
        template_id: taskData.template_id,
        template_name: taskData.template_name,
        template_inputs: taskData.template_inputs || {},
        custom_task: taskData.custom_task,
        status: 'queued',
        current_step: 'Initializing task...',
        progress: 0,
      }]);

    if (error) throw error;

    // Add initial log entry
    await this.addExecutionLog(runId, 1, 'Task queued for execution');

    return runId;
  }

  async updateTaskRun(runId: string, updates: Partial<DatabaseTaskRun>): Promise<void> {
    const { error } = await supabase
      .from('task_runs')
      .update(updates)
      .eq('id', runId);

    if (error) throw error;
  }

  async addExecutionLog(runId: string, stepNumber: number, message: string, screenshotUrl?: string): Promise<void> {
    const { error } = await supabase
      .from('execution_logs')
      .insert([{
        run_id: runId,
        step_number: stepNumber,
        message,
        screenshot_url: screenshotUrl,
      }]);

    if (error) throw error;
  }

  async getTaskRun(runId: string): Promise<DatabaseTaskRun | null> {
    const { data, error } = await supabase
      .from('task_runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (error) return null;
    return data;
  }

  async getUserTaskRuns(): Promise<DatabaseTaskRun[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('task_runs')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false });

    if (error) return [];
    return data || [];
  }

  async getExecutionLogs(runId: string): Promise<DatabaseExecutionLog[]> {
    const { data, error } = await supabase
      .from('execution_logs')
      .select('*')
      .eq('run_id', runId)
      .order('step_number', { ascending: true });

    if (error) return [];
    return data || [];
  }

  subscribeToTaskRun(runId: string, callback: (taskRun: DatabaseTaskRun) => void) {
    return supabase
      .channel(`task_run_${runId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'task_runs',
          filter: `id=eq.${runId}`
        },
        (payload) => {
          callback(payload.new as DatabaseTaskRun);
        }
      )
      .subscribe();
  }

  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
}

export const supabaseTaskService = new SupabaseTaskService();
