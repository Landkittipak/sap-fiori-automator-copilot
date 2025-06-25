
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface ExecutionStatus {
  id: string;
  type: 'template' | 'workflow';
  name: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime: string;
  endTime?: string;
  duration?: number;
  progress?: number;
  error?: string;
}

export const ExecutionMonitor = () => {
  const [executions, setExecutions] = useState<ExecutionStatus[]>([
    {
      id: '1',
      type: 'template',
      name: 'Material Master Update',
      status: 'running',
      startTime: '2024-01-26T10:30:00Z',
      progress: 65,
    },
    {
      id: '2',
      type: 'workflow',
      name: 'Purchase Order Processing',
      status: 'completed',
      startTime: '2024-01-26T10:25:00Z',
      endTime: '2024-01-26T10:28:00Z',
      duration: 180,
    },
    {
      id: '3',
      type: 'template',
      name: 'Inventory Check',
      status: 'failed',
      startTime: '2024-01-26T10:20:00Z',
      endTime: '2024-01-26T10:22:00Z',
      duration: 120,
      error: 'Connection timeout to SAP system',
    },
  ]);

  const getStatusIcon = (status: ExecutionStatus['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: ExecutionStatus['status']) => {
    const variants = {
      running: 'default',
      completed: 'default',
      failed: 'destructive',
      pending: 'secondary',
    } as const;

    const colors = {
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString();
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setExecutions(prev => prev.map(exec => {
        if (exec.status === 'running' && exec.progress !== undefined) {
          const newProgress = Math.min(exec.progress + Math.random() * 10, 100);
          if (newProgress >= 100) {
            return {
              ...exec,
              status: 'completed' as const,
              endTime: new Date().toISOString(),
              duration: Math.floor((Date.now() - new Date(exec.startTime).getTime()) / 1000),
              progress: undefined,
            };
          }
          return { ...exec, progress: newProgress };
        }
        return exec;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const activeExecutions = executions.filter(e => e.status === 'running' || e.status === 'pending');
  const recentExecutions = executions.filter(e => e.status === 'completed' || e.status === 'failed');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Execution Monitor</h2>
        <p className="text-gray-600 dark:text-gray-400">Real-time monitoring of running tasks and workflows</p>
      </div>

      {/* Active Executions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600" />
            Active Executions
          </CardTitle>
          <CardDescription>
            Currently running tasks and workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeExecutions.length > 0 ? (
            <div className="space-y-4">
              {activeExecutions.map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(execution.status)}
                    <div>
                      <h4 className="font-medium">{execution.name}</h4>
                      <p className="text-sm text-gray-500">
                        Started at {formatTime(execution.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {execution.progress !== undefined && (
                      <div className="text-sm font-medium">
                        {Math.round(execution.progress)}%
                      </div>
                    )}
                    {getStatusBadge(execution.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active executions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Completed and failed executions from today</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {recentExecutions.map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(execution.status)}
                    <div>
                      <h4 className="font-medium">{execution.name}</h4>
                      <p className="text-sm text-gray-500">
                        {formatTime(execution.startTime)} - {execution.endTime && formatTime(execution.endTime)}
                      </p>
                      {execution.error && (
                        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          {execution.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {execution.duration && (
                      <div className="text-sm text-gray-500">
                        {formatDuration(execution.duration)}
                      </div>
                    )}
                    {getStatusBadge(execution.status)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
