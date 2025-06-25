
import { useState, useEffect } from 'react';
import { databaseTaskExecutionService, type RunStatus } from '@/services/DatabaseTaskExecutionService';
import { type TaskSubmissionData } from '@/services/SupabaseTaskService';

export const useDatabaseTaskExecution = (runId?: string) => {
  const [status, setStatus] = useState<RunStatus | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!runId) return;

    // Get initial status
    const getInitialStatus = async () => {
      const initialStatus = await databaseTaskExecutionService.getRunStatus(runId);
      setStatus(initialStatus);
    };

    getInitialStatus();

    // Subscribe to updates
    const handleStatusUpdate = (newStatus: RunStatus) => {
      setStatus(newStatus);
      setIsLoading(false);
    };

    const subscription = databaseTaskExecutionService.subscribeToRun(runId, handleStatusUpdate);

    return () => {
      databaseTaskExecutionService.unsubscribeFromRun(runId);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [runId]);

  const executeTask = async (taskData: TaskSubmissionData) => {
    setIsLoading(true);
    try {
      const newRunId = await databaseTaskExecutionService.executeTask(taskData);
      return newRunId;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return {
    status,
    isLoading,
    executeTask,
  };
};

export const useDatabaseRunHistory = () => {
  const [runs, setRuns] = useState<RunStatus[]>([]);

  const refreshRuns = async () => {
    try {
      const allRuns = await databaseTaskExecutionService.getAllRuns();
      setRuns(allRuns);
    } catch (error) {
      console.error('Error fetching runs:', error);
    }
  };

  useEffect(() => {
    refreshRuns();
    
    // Set up periodic refresh for run history
    const interval = setInterval(refreshRuns, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    runs,
    refreshRuns,
  };
};
