import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cuaWorkflowService } from '@/services/CuaWorkflowService';
import { 
  Zap, 
  LogIn, 
  FileText, 
  BarChart3, 
  Navigation, 
  FolderOpen, 
  Globe, 
  Play,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface QuickTask {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  taskType: string;
  parameters: Record<string, any>;
  color: string;
}

const quickTasks: QuickTask[] = [
  {
    id: 'sap-login',
    title: 'SAP Login',
    description: 'Login to SAP Fiori system',
    icon: LogIn,
    taskType: 'sap-login',
    parameters: { sapUrl: '', username: '' },
    color: 'bg-blue-500'
  },
  {
    id: 'sap-data-entry',
    title: 'Data Entry',
    description: 'Enter data into SAP forms',
    icon: FileText,
    taskType: 'sap-data-entry',
    parameters: { transaction: 'MM60', formData: {} },
    color: 'bg-green-500'
  },
  {
    id: 'sap-navigation',
    title: 'Navigate SAP',
    description: 'Navigate to specific SAP screens',
    icon: Navigation,
    taskType: 'sap-navigation',
    parameters: { screen: '', target: '' },
    color: 'bg-orange-500'
  },
  {
    id: 'browser-automation',
    title: 'Browser Automation',
    description: 'Automate browser actions',
    icon: Globe,
    taskType: 'browser-automation',
    parameters: { url: '', action: '' },
    color: 'bg-teal-500'
  }
];

export function CuaQuickTasks() {
  const [executingTasks, setExecutingTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<QuickTask | null>(null);
  const [customParameters, setCustomParameters] = useState<Record<string, any>>({});
  const [customTask, setCustomTask] = useState('');
  const { toast } = useToast();
  const [advancedMode, setAdvancedMode] = useState(false);
  const [material, setMaterial] = useState('');
  const [plant, setPlant] = useState('');
  const [quantity, setQuantity] = useState('');

  const executeTask = async (task: QuickTask, parameters?: Record<string, any>) => {
    try {
      setExecutingTasks(prev => new Set(prev).add(task.id));
      
      const taskParameters = parameters || task.parameters;
      const taskId = await cuaWorkflowService.executeQuickTask(task.taskType, taskParameters);
      
      toast({
        title: "Task Started",
        description: `${task.title} is now executing`,
      });
      
      // Monitor task status
      monitorTaskStatus(taskId, task.title);
      
    } catch (error) {
      console.error('Error executing task:', error);
      toast({
        title: "Task Failed",
        description: `Failed to execute ${task.title}`,
        variant: "destructive",
      });
    } finally {
      setExecutingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
  };

  const executeCustomTask = async () => {
    if (!customTask.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    try {
      const taskId = await cuaWorkflowService.executeTask(customTask);
      
      toast({
        title: "Custom Task Started",
        description: "Your custom task is now executing",
      });
      
      setCustomTask('');
      monitorTaskStatus(taskId, "Custom Task");
      
    } catch (error) {
      console.error('Error executing custom task:', error);
      toast({
        title: "Task Failed",
        description: "Failed to execute custom task",
        variant: "destructive",
      });
    }
  };

  const monitorTaskStatus = async (taskId: string, taskName: string) => {
    const checkStatus = async () => {
      try {
        const status = await cuaWorkflowService.getTaskStatus(taskId);
        
        if (status.status === 'completed') {
          toast({
            title: "Task Completed",
            description: `${taskName} completed successfully`,
          });
          return;
        } else if (status.status === 'failed') {
          toast({
            title: "Task Failed",
            description: `${taskName} failed: ${status.error}`,
            variant: "destructive",
          });
          return;
        }
        
        // Continue monitoring
        setTimeout(checkStatus, 2000);
      } catch (error) {
        console.error('Error monitoring task:', error);
      }
    };
    
    checkStatus();
  };

  const getStatusIcon = (taskId: string) => {
    if (executingTasks.has(taskId)) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    return <Play className="h-4 w-4" />;
  };

  // Helper to build formData JSON for MM60
  const buildFormData = () => {
    return {
      material: material || undefined,
      plant: plant || undefined,
      quantity: quantity || undefined,
    };
  };

  return (
    <div className="space-y-6">
      {/* Quick Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickTasks.map((task) => {
          const Icon = task.icon;
          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${task.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    CUA
                  </Badge>
                </div>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <CardDescription>{task.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setSelectedTask(task)}
                  disabled={executingTasks.has(task.id)}
                  className="w-full"
                  variant="outline"
                >
                  {getStatusIcon(task.id)}
                  <span className="ml-2">
                    {executingTasks.has(task.id) ? 'Executing...' : 'Configure & Run'}
                  </span>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Custom Task
          </CardTitle>
          <CardDescription>
            Execute any custom task with natural language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-task">Task Description</Label>
            <Textarea
              id="custom-task"
              value={customTask}
              onChange={(e) => setCustomTask(e.target.value)}
              placeholder="Describe what you want the CUA agent to do... (e.g., 'Open SAP Fiori, login, and navigate to transaction MM60')"
              rows={3}
            />
          </div>
          <Button 
            onClick={executeCustomTask}
            disabled={!customTask.trim()}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            Execute Custom Task
          </Button>
        </CardContent>
      </Card>

      {/* Task Configuration Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {selectedTask?.title}</DialogTitle>
            <DialogDescription>
              {selectedTask?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              {selectedTask.taskType === 'sap-login' && (
                <>
                  <div>
                    <Label htmlFor="sap-url">SAP URL</Label>
                    <Input
                      id="sap-url"
                      value={customParameters.sapUrl || ''}
                      onChange={(e) => setCustomParameters(prev => ({ ...prev, sapUrl: e.target.value }))}
                      placeholder="https://your-sap-system.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={customParameters.username || ''}
                      onChange={(e) => setCustomParameters(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Your SAP username"
                    />
                  </div>
                </>
              )}
              
              {selectedTask.taskType === 'sap-data-entry' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Switch
                      checked={advancedMode}
                      onCheckedChange={setAdvancedMode}
                      id="advanced-mode"
                    />
                    <Label htmlFor="advanced-mode">Advanced (JSON) mode</Label>
                  </div>
                  {!advancedMode ? (
                    <>
                      <div>
                        <Label htmlFor="transaction">Transaction</Label>
                        <Input
                          id="transaction"
                          value={customParameters.transaction || 'MM60'}
                          onChange={(e) => setCustomParameters(prev => ({ ...prev, transaction: e.target.value }))}
                          placeholder="MM60"
                        />
                      </div>
                      <div>
                        <Label htmlFor="material">Material</Label>
                        <Input
                          id="material"
                          value={material}
                          onChange={(e) => setMaterial(e.target.value)}
                          placeholder="e.g. MAT001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="plant">Plant</Label>
                        <Input
                          id="plant"
                          value={plant}
                          onChange={(e) => setPlant(e.target.value)}
                          placeholder="e.g. 1000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="e.g. 10"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        <strong>Form Data Preview:</strong>
                        <pre className="bg-gray-50 p-2 rounded mt-1 overflow-auto">{JSON.stringify(buildFormData(), null, 2)}</pre>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="form-data">Form Data (JSON)</Label>
                        <Textarea
                          id="form-data"
                          value={customParameters.formData || '{}'}
                          onChange={(e) => setCustomParameters(prev => ({ ...prev, formData: e.target.value }))}
                          placeholder='{"material": "MAT001", "plant": "1000", "quantity": "10"}'
                          rows={3}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Example: {'{"material": "MAT001", "plant": "1000", "quantity": "10"}'}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTask(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    let params = customParameters;
                    if (selectedTask.taskType === 'sap-data-entry' && !advancedMode) {
                      params = {
                        ...customParameters,
                        formData: buildFormData(),
                      };
                    }
                    executeTask(selectedTask, params);
                    setSelectedTask(null);
                    setCustomParameters({});
                    setMaterial('');
                    setPlant('');
                    setQuantity('');
                  }}
                  disabled={executingTasks.has(selectedTask.id)}
                  className="flex-1"
                >
                  {executingTasks.has(selectedTask.id) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 