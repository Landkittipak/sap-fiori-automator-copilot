
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock, Play } from 'lucide-react';
import { RunStatus } from '@/services/DatabaseTaskExecutionService';

interface LiveExecutionStatusProps {
  status: RunStatus;
}

export const LiveExecutionStatus = ({ status }: LiveExecutionStatusProps) => {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <Play className="w-5 h-5 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Queued</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>Execution Status</span>
        </CardTitle>
        <CardDescription>Task ID: {status.id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          {getStatusBadge()}
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{status.progress}%</span>
          </div>
          <Progress value={status.progress} className="w-full" />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900 mb-1">Current Step:</p>
          <p className="text-sm text-gray-600">{status.currentStep}</p>
        </div>

        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm font-medium text-red-900">Error:</p>
            <p className="text-sm text-red-700">{status.error}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Execution Log:</p>
          <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded text-xs space-y-1">
            {status.logs.map((log, index) => (
              <div key={index} className="flex">
                <span className="text-gray-500 mr-2">{index + 1}.</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">Started:</span>
            <br />
            {new Date(status.startTime).toLocaleString()}
          </div>
          {status.endTime && (
            <div>
              <span className="font-medium">Completed:</span>
              <br />
              {new Date(status.endTime).toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
