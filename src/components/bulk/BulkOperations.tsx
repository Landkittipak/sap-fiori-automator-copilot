
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Upload, 
  Download,
  FileText,
  Trash2,
  Plus,
  Settings,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDatabaseTaskExecution } from '@/hooks/useDatabaseTaskExecution';

interface BulkTask {
  id: string;
  template: string;
  inputs: Record<string, string>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  runId?: string;
}

export const BulkOperations = () => {
  const [tasks, setTasks] = useState<BulkTask[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [csvData, setCsvData] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const { toast } = useToast();
  const { executeTask } = useDatabaseTaskExecution();

  const templates = [
    { id: 'stock-transfer', name: 'Stock Transfer', inputs: ['material', 'qty', 'from_plant', 'to_plant'] },
    { id: 'lead-time-update', name: 'Lead Time Update', inputs: ['material', 'new_days'] },
    { id: 'stock-check', name: 'Stock Check', inputs: ['material'] },
  ];

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        setCsvData(csv);
        parseCsvToTasks(csv);
      };
      reader.readAsText(file);
    }
  };

  const parseCsvToTasks = (csv: string) => {
    if (!selectedTemplate) {
      toast({
        title: "Select Template First",
        description: "Please select a template before uploading CSV data.",
        variant: "destructive",
      });
      return;
    }

    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const template = templates.find(t => t.id === selectedTemplate);
    
    if (!template) return;

    const newTasks: BulkTask[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const inputs: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        if (template.inputs.includes(header) && values[index]) {
          inputs[header] = values[index];
        }
      });

      if (Object.keys(inputs).length > 0) {
        newTasks.push({
          id: `task-${Date.now()}-${i}`,
          template: selectedTemplate,
          inputs,
          status: 'pending'
        });
      }
    }

    setTasks(newTasks);
    toast({
      title: "CSV Parsed",
      description: `${newTasks.length} tasks created from CSV data.`,
    });
  };

  const addManualTask = () => {
    if (!selectedTemplate) {
      toast({
        title: "Select Template First",
        description: "Please select a template before adding tasks.",
        variant: "destructive",
      });
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const inputs: Record<string, string> = {};
    template.inputs.forEach(input => {
      inputs[input] = '';
    });

    setTasks([...tasks, {
      id: `task-${Date.now()}`,
      template: selectedTemplate,
      inputs,
      status: 'pending'
    }]);
  };

  const updateTaskInput = (taskId: string, inputName: string, value: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, inputs: { ...task.inputs, [inputName]: value } }
        : task
    ));
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const executeBulkTasks = async () => {
    if (tasks.length === 0) {
      toast({
        title: "No Tasks",
        description: "Please add some tasks before executing.",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    setExecutionProgress(0);

    try {
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        
        // Update task status to running
        setTasks(currentTasks => 
          currentTasks.map(t => 
            t.id === task.id ? { ...t, status: 'running' as const } : t
          )
        );

        try {
          const template = templates.find(t => t.id === task.template);
          const runId = await executeTask({
            template_name: template?.name,
            template_inputs: task.inputs
          });

          // Update task with run ID and completed status
          setTasks(currentTasks => 
            currentTasks.map(t => 
              t.id === task.id ? { ...t, status: 'completed' as const, runId } : t
            )
          );

        } catch (error) {
          // Update task status to failed
          setTasks(currentTasks => 
            currentTasks.map(t => 
              t.id === task.id ? { ...t, status: 'failed' as const } : t
            )
          );
        }

        // Update progress
        setExecutionProgress(((i + 1) / tasks.length) * 100);
        
        // Small delay between tasks
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast({
        title: "Bulk Execution Complete",
        description: `${tasks.filter(t => t.status === 'completed').length} tasks completed successfully.`,
      });

    } finally {
      setIsExecuting(false);
    }
  };

  const downloadTemplate = () => {
    if (!selectedTemplate) {
      toast({
        title: "Select Template First",
        description: "Please select a template to download its CSV template.",
        variant: "destructive",
      });
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const csvContent = template.inputs.join(',') + '\n' + 
                      template.inputs.map(() => 'example_value').join(',');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.toLowerCase().replace(/\s+/g, '_')}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running':
        return <Clock className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'failed':
        return <div className="w-4 h-4 rounded-full bg-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running':
        return <Badge className="bg-yellow-100 text-yellow-800">Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
        <p className="text-gray-600">Execute multiple automation tasks efficiently</p>
      </div>

      {/* Setup Section */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Bulk Tasks</CardTitle>
          <CardDescription>Configure your bulk execution parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose automation template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end space-x-2">
              <Button variant="outline" onClick={downloadTemplate} disabled={!selectedTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload CSV file
                  </span>
                  <span className="mt-2 block text-sm text-gray-500">
                    or drag and drop your data file here
                  </span>
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={addManualTask} disabled={!selectedTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Manual Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Task Queue ({tasks.length} tasks)</CardTitle>
                <CardDescription>Review and execute your bulk operations</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={executeBulkTasks} 
                  disabled={isExecuting || tasks.length === 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isExecuting ? 'Executing...' : 'Execute All'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isExecuting && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Execution Progress</span>
                  <span>{Math.round(executionProgress)}%</span>
                </div>
                <Progress value={executionProgress} className="w-full" />
              </div>
            )}

            <div className="space-y-3">
              {tasks.map((task) => {
                const template = templates.find(t => t.id === task.template);
                return (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(task.status)}
                        <span className="font-medium">{template?.name}</span>
                        {getStatusBadge(task.status)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(task.id)}
                        disabled={isExecuting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {template?.inputs.map(inputName => (
                        <div key={inputName}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {inputName.replace('_', ' ').toUpperCase()}
                          </label>
                          <Input
                            value={task.inputs[inputName] || ''}
                            onChange={(e) => updateTaskInput(task.id, inputName, e.target.value)}
                            disabled={isExecuting || task.status !== 'pending'}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
