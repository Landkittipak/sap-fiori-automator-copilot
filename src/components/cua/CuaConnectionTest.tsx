import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { realWorkflowExecutionService } from '@/services/RealWorkflowExecutionService';
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';

export const CuaConnectionTest = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isTestingHealth, setIsTestingHealth] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ status: string; message: string } | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ status: string; timestamp: string } | null>(null);
  const { toast } = useToast();

  const testCuaConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await realWorkflowExecutionService.testConnection();
      setConnectionStatus(result);
      
      if (result.status === 'success') {
        toast({
          title: "Connection Successful",
          description: "CUA backend is connected and ready for automation!",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionStatus({ status: 'error', message: errorMessage });
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testHealthCheck = async () => {
    setIsTestingHealth(true);
    try {
      const result = await realWorkflowExecutionService.healthCheck();
      setHealthStatus(result);
      toast({
        title: "Health Check Passed",
        description: "Backend is healthy and operational",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Health Check Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTestingHealth(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          CUA Connection Test
        </CardTitle>
        <CardDescription>
          Test the connection to your CUA automation backend
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testCuaConnection}
            disabled={isTestingConnection}
            className="flex items-center gap-2"
          >
            {isTestingConnection ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Test CUA Connection
          </Button>
          
          <Button 
            variant="outline"
            onClick={testHealthCheck}
            disabled={isTestingHealth}
            className="flex items-center gap-2"
          >
            {isTestingHealth ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Health Check
          </Button>
        </div>

        {connectionStatus && (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {connectionStatus.status === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="font-medium">CUA Connection Status</span>
            </div>
            <p className="text-sm text-gray-600">{connectionStatus.message}</p>
          </div>
        )}

        {healthStatus && (
          <div className="p-4 border rounded-lg bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">Backend Health</span>
            </div>
            <p className="text-sm text-gray-600">Status: {healthStatus.status}</p>
            <p className="text-sm text-gray-600">Timestamp: {healthStatus.timestamp}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Make sure your backend is running on http://localhost:8000</p>
          <p>• Configure your CUA_API_KEY in backend/.env</p>
          <p>• Ensure your SAP Fiori is accessible to CUA agents</p>
        </div>
      </CardContent>
    </Card>
  );
};