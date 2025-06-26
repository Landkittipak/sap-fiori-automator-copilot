import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { realWorkflowExecutionService } from '@/services/RealWorkflowExecutionService';
import { 
  Play, 
  Pause, 
  Square, 
  Monitor, 
  Camera, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock,
  Activity,
  Globe,
  MousePointer
} from 'lucide-react';

interface ExecutionStatus {
  run_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_step?: number;
  total_steps: number;
  results: Record<string, any>;
  error?: string;
  started_at: string;
  completed_at?: string;
}

export const LiveExecutionMonitor = ({ runId, onClose }: { runId: string | null; onClose: () => void }) => {
  const [status, setStatus] = useState<ExecutionStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (runId && !isPolling) {
      setIsPolling(true);
      startPolling();
    }
  }, [runId]);

  const startPolling = async () => {
    if (!runId) return;

    try {
      await realWorkflowExecutionService.pollExecutionStatus(
        runId,
        (newStatus) => {
          setStatus(newStatus);
        }
      );
      setIsPolling(false);
    } catch (error) {
      toast({
        title: "Monitoring Error",
        description: error instanceof Error ? error.message : "Failed to monitor execution",
        variant: "destructive",
      });
      setIsPolling(false);
    }
  };

  const handleCancel = async () => {
    if (!runId) return;

    try {
      await realWorkflowExecutionService.cancelExecution(runId);
      toast({
        title: "Execution Cancelled",
        description: "The automation has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel execution",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'running':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <Square className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    if (!status) return 0;
    if (status.status === 'completed') return 100;
    if (status.status === 'failed' || status.status === 'cancelled') return 0;
    if (!status.current_step) return 0;
    return Math.round((status.current_step / status.total_steps) * 100);
  };

  if (!runId) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No execution to monitor</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="w-5 h-5" />
                Live Execution Monitor
              </CardTitle>
              <CardDescription>
                Real-time monitoring of CUA agent automation
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Execution Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status && getStatusIcon(status.status)}
              <div>
                <p className="font-medium">Execution Status</p>
                <p className="text-sm text-gray-600">Run ID: {runId}</p>
              </div>
            </div>
            {status && (
              <Badge className={getStatusColor(status.status)}>
                {status.status.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          {status && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{status.current_step || 0} / {status.total_steps} steps</span>
              </div>
              <Progress value={getProgressPercentage()} className="w-full" />
            </div>
          )}

          {/* CUA Agent Info */}
          {status?.results?.agent_id && (
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">CUA Cloud Agent</span>
                </div>
                <p className="text-sm text-gray-600">Agent ID: {status.results.agent_id}</p>
                <p className="text-sm text-gray-600">Browser automation running in cloud VM</p>
              </CardContent>
            </Card>
          )}

          {/* Current Action */}
          {status?.status === 'running' && status.current_step && (
            <Card className="bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Current Action</span>
                </div>
                <p className="text-sm">Executing step {status.current_step} of {status.total_steps}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-green-600 animate-pulse" />
                  <span className="text-xs text-green-700">Browser automation in progress...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step Results */}
          {status?.results && Object.keys(status.results).length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Step Results</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {Object.entries(status.results)
                    .filter(([key]) => key.startsWith('step_'))
                    .map(([key, result]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                                                  <Badge className="text-xs">
                          {typeof result === 'object' && result && 'action' in result ? (result as any).action || 'Completed' : 'Success'}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {status?.error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-700">Execution Error</span>
                </div>
                <p className="text-sm text-red-600">{status.error}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {status?.status === 'running' && (
              <Button 
                variant="destructive" 
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Cancel Execution
              </Button>
            )}
            
            {status?.results?.agent_id && status.status === 'running' && (
              <Button 
                variant="outline"
                onClick={() => {
                  // This would trigger a screenshot from the CUA agent
                  toast({
                    title: "Screenshot Requested",
                    description: "Taking screenshot of current browser state...",
                  });
                }}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Take Screenshot
              </Button>
            )}
          </div>

          {/* Timestamps */}
          {status && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>Started: {new Date(status.started_at).toLocaleString()}</p>
              {status.completed_at && (
                <p>Completed: {new Date(status.completed_at).toLocaleString()}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};