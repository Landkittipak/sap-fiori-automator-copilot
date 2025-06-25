
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type BackupJob = Database['public']['Tables']['backup_jobs']['Row'];

class BackupService {
  async createBackup(type: 'full' | 'templates' | 'executions'): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: job, error } = await supabase
      .from('backup_jobs')
      .insert({
        user_id: user.id,
        backup_type: type,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Start backup process asynchronously
    this.processBackup(job.id, type);

    return job.id;
  }

  private async processBackup(jobId: string, type: string) {
    try {
      await this.updateBackupJob(jobId, { status: 'running', progress: 0 });

      let data: any = {};

      if (type === 'full' || type === 'templates') {
        const templates = await this.getUserTemplates();
        data.templates = templates;
        await this.updateBackupJob(jobId, { progress: 33 });
      }

      if (type === 'full' || type === 'executions') {
        const executions = await this.getUserTaskRuns();
        data.executions = executions;
        await this.updateBackupJob(jobId, { progress: 66 });
      }

      // Simulate file creation and storage
      const backupData = JSON.stringify(data);
      const fileName = `backup_${type}_${Date.now()}.json`;
      
      await this.updateBackupJob(jobId, {
        status: 'completed',
        progress: 100,
        file_path: fileName,
        file_size: backupData.length,
        completed_at: new Date().toISOString(),
      });

    } catch (error) {
      await this.updateBackupJob(jobId, {
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      });
    }
  }

  async getUserBackups(): Promise<BackupJob[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('backup_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async restoreBackup(jobId: string): Promise<void> {
    // Implementation for restore functionality
    console.log('Restoring backup:', jobId);
  }

  private async updateBackupJob(jobId: string, updates: Partial<BackupJob>) {
    const { error } = await supabase
      .from('backup_jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) throw error;
  }

  private async getUserTemplates() {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', user.id);

    return data || [];
  }

  private async getUserTaskRuns() {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('task_runs')
      .select('*')
      .eq('user_id', user.id);

    return data || [];
  }

  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
}

export const backupService = new BackupService();
