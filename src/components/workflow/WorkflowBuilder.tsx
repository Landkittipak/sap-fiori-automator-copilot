
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Move, 
  Eye, 
  Camera, 
  CheckCircle, 
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Settings,
  Edit
} from 'lucide-react';
import { workflowService, type WorkflowStepConfig } from '@/services/WorkflowService';
import { StepConfigDialog } from './StepConfigDialog';
import type { Database } from '@/integrations/supabase/types';

type WorkflowStep = Database['public']['Tables']['workflow_steps']['Row'];

interface WorkflowBuilderProps {
  templateId: string;
}

export const WorkflowBuilder = ({ templateId }: WorkflowBuilderProps) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [newStep, setNewStep] = useState({
    type: 'action' as const,
    config: {} as WorkflowStepConfig,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSteps();
  }, [templateId]);

  const loadSteps = async () => {
    try {
      const data = await workflowService.getWorkflowSteps(templateId);
      setSteps(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load workflow steps",
        variant: "destructive",
      });
    }
  };

  const handleAddStep = async () => {
    setLoading(true);
    try {
      await workflowService.createWorkflowStep({
        templateId,
        stepOrder: steps.length + 1,
        stepType: newStep.type,
        config: newStep.config,
      });

      toast({
        title: "Success",
        description: "Workflow step added successfully",
      });

      setNewStep({ type: 'action', config: {} });
      loadSteps();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add workflow step",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStep = async (stepId: string, config: WorkflowStepConfig, name?: string) => {
    try {
      await workflowService.updateWorkflowStep(stepId, config);
      
      toast({
        title: "Success",
        description: "Workflow step updated successfully",
      });
      
      loadSteps();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow step",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      await workflowService.deleteWorkflowStep(stepId);
      toast({
        title: "Success",
        description: "Workflow step deleted successfully",
      });
      loadSteps();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow step",
        variant: "destructive",
      });
    }
  };

  const handleMoveStep = async (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(step => step.id === stepId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= steps.length) return;

    const reorderedSteps = [...steps];
    [reorderedSteps[currentIndex], reorderedSteps[newIndex]] = 
    [reorderedSteps[newIndex], reorderedSteps[currentIndex]];

    try {
      await workflowService.reorderSteps(
        templateId, 
        reorderedSteps.map(step => step.id)
      );
      loadSteps();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder steps",
        variant: "destructive",
      });
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'action': return <Move className="w-4 h-4" />;
      case 'validation': return <CheckCircle className="w-4 h-4" />;
      case 'screenshot': return <Camera className="w-4 h-4" />;
      case 'condition': return <Eye className="w-4 h-4" />;
      case 'loop': return <RotateCcw className="w-4 h-4" />;
      default: return <Move className="w-4 h-4" />;
    }
  };

  const getStepDescription = (step: WorkflowStep) => {
    const config = step.step_config as WorkflowStepConfig;
    
    switch (step.step_type) {
      case 'action':
        return config.description || `${config.action || 'Action'} on ${config.selector || 'element'}`;
      case 'condition':
        return config.description || `Check ${config.conditionType || 'condition'} on ${config.selector || 'element'}`;
      case 'validation':
        return config.description || `Validate ${config.validation?.rule || 'rule'} on ${config.selector || 'element'}`;
      case 'delay':
        return config.description || `Wait for ${config.duration || 'specified'} seconds`;
      case 'loop':
        return config.description || `Repeat ${config.value || 'N'} times`;
      default:
        return config.description || 'Step configuration';
    }
  };

  const renderStepConfig = (type: string) => {
    switch (type) {
      case 'action':
        return (
          <div className="grid grid-cols-3 gap-2">
            <Select 
              value={newStep.config.action} 
              onValueChange={(value) => setNewStep(prev => ({
                ...prev,
                config: { ...prev.config, action: value }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="click">Click</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="wait">Wait</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Selector"
              value={newStep.config.selector || ''}
              onChange={(e) => setNewStep(prev => ({
                ...prev,
                config: { ...prev.config, selector: e.target.value }
              }))}
            />
            <Input
              placeholder="Value"
              value={newStep.config.value || ''}
              onChange={(e) => setNewStep(prev => ({
                ...prev,
                config: { ...prev.config, value: e.target.value }
              }))}
            />
          </div>
        );
      
      case 'validation':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Element selector"
              value={newStep.config.selector || ''}
              onChange={(e) => setNewStep(prev => ({
                ...prev,
                config: { ...prev.config, selector: e.target.value }
              }))}
            />
            <Select 
              value={newStep.config.validation?.rule} 
              onValueChange={(value) => setNewStep(prev => ({
                ...prev,
                config: { 
                  ...prev.config, 
                  validation: { ...prev.config.validation, rule: value, type: 'element' }
                }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Validation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toBeVisible">To Be Visible</SelectItem>
                <SelectItem value="toHaveText">To Have Text</SelectItem>
                <SelectItem value="toBeEnabled">To Be Enabled</SelectItem>
                <SelectItem value="toBeDisabled">To Be Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'condition':
        return (
          <Input
            placeholder="Condition selector"
            value={newStep.config.selector || ''}
            onChange={(e) => setNewStep(prev => ({
              ...prev,
              config: { ...prev.config, selector: e.target.value }
            }))}
          />
        );
      
      case 'loop':
        return (
          <Input
            type="number"
            placeholder="Iterations"
            value={newStep.config.value || ''}
            onChange={(e) => setNewStep(prev => ({
              ...prev,
              config: { ...prev.config, value: e.target.value }
            }))}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Step</CardTitle>
          <CardDescription>
            Build your automation workflow with drag-and-drop steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Step Type</Label>
              <Select 
                value={newStep.type} 
                onValueChange={(value: any) => setNewStep(prev => ({
                  ...prev,
                  type: value,
                  config: {}
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                  <SelectItem value="screenshot">Screenshot</SelectItem>
                  <SelectItem value="condition">Condition</SelectItem>
                  <SelectItem value="loop">Loop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <Label>Configuration</Label>
              {renderStepConfig(newStep.type)}
            </div>
          </div>
          
          <Button onClick={handleAddStep} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Workflow Steps</h3>
        {steps.map((step, index) => (
          <Card key={step.id} className="border-l-4 border-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getStepIcon(step.step_type)}
                      Step {step.step_order}
                    </Badge>
                    <span className="font-medium capitalize">{step.step_type}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {getStepDescription(step)}
                  </p>
                  
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                    {workflowService.generateStepCode(step)}
                  </code>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingStep(step)}
                    title="Configure step"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveStep(step.id, 'up')}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveStep(step.id, 'down')}
                    disabled={index === steps.length - 1}
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteStep(step.id)}
                    title="Delete step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {steps.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Move className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No workflow steps defined</p>
              <p className="text-sm text-gray-500 mt-2">
                Add your first step to start building the automation workflow
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <StepConfigDialog
        step={editingStep}
        isOpen={!!editingStep}
        onClose={() => setEditingStep(null)}
        onSave={handleUpdateStep}
      />
    </div>
  );
};
