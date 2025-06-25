
import { useState, useEffect } from 'react';
import { taskExecutionService, type RunStatus } from '@/services/TaskExecutionService';

export const useTaskExecution = (runId?: string) => {
  const [status, setStatus] = useState<RunStatus | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!runId) return;

    // Get initial status
    const initialStatus = taskExecutionService.getRunStatus(runId);
    setStatus(initialStatus);

    // Subscribe to updates
    const handleStatusUpdate = (newStatus: RunStatus) => {
      setStatus(newStatus);
      setIsLoading(false);
    };

    taskExecutionService.subscribeToRun(runId, handleStatusUpdate);

    return () => {
      taskExecutionService.unsubscribeFromRun(runId);
    };
  }, [runId]);

  const executeTask = async (taskData: {
    template?: string;
    templateInputs?: Record<string, string>;
    customTask?: string;
  }) => {
    setIsLoading(true);
    try {
      const newRunId = await taskExecutionService.executeTask(taskData);
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

export const useRunHistory = () => {
  const [runs, setRuns] = useState<RunStatus[]>([]);

  const refreshRuns = () => {
    setRuns(taskExecutionService.getAllRuns());
  };

  useEffect(() => {
    refreshRuns();
    
    // Set up periodic refresh for run history
    const interval = setInterval(refreshRuns, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    runs,
    refreshRuns,
  };
};
