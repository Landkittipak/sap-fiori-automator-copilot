import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Play, 
  Save, 
  Settings, 
  GitBranch, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Trash2,
  ArrowUp,
  ArrowDown,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Draggable } from '@/components/ui/draggable';
import { StepConfigDialog } from '@/components/workflow/StepConfigDialog';

interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'delay' | 'approval' | 'cua_automation';
  name: string;
  description: string;
  config: any;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'paused';
  created: string;
  lastRun?: string;
}

export const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);
  const { toast } = useToast();

  const stepTypes = [
    {
      type: 'action',
      name: 'SAP Action',
      description: 'Execute SAP operation',
      icon: Play,
      color: 'bg-blue-500',
    },
    {
      type: 'condition',
      name: 'Condition',
      description: 'Conditional branching',
      icon: GitBranch,
      color: 'bg-yellow-500',
    },
    {
      type: 'delay',
      name: 'Delay',
      description: 'Wait for specified time',
      icon: Clock,
      color: 'bg-gray-500',
    },
    {
      type: 'approval',
      name: 'Approval',
      description: 'Human approval required',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      type: 'cua_automation',
      name: 'Cua Automation',
      description: 'Trigger Cua AI automation',
      icon: Zap,
      color: 'bg-purple-500',
    },
  ];

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `workflow_${Date.now()}`,
      name: 'New Workflow',
      description: '',
      steps: [],
      status: 'draft',
      created: new Date().toISOString(),
    };
    setCurrentWorkflow(newWorkflow);
    setIsEditing(true);
    console.log('Created new workflow:', newWorkflow);
  };

  const addStep = (stepType: string) => {
    if (!currentWorkflow) {
      console.log('No current workflow to add step to');
      return;
    }

    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: stepType as 'action' | 'condition' | 'delay' | 'approval' | 'cua_automation',
      name: `New ${stepType}`,
      description: '',
      config: {},
    };

    const updatedWorkflow = {
      ...currentWorkflow,
      steps: [...currentWorkflow.steps, newStep],
    };

    setCurrentWorkflow(updatedWorkflow);
    console.log('Added step:', newStep);
  };

  const reorderSteps = (dragIndex: number, hoverIndex: number) => {
    if (!currentWorkflow) return;

    const dragStep = currentWorkflow.steps[dragIndex];
    const newSteps = [...currentWorkflow.steps];
    newSteps.splice(dragIndex, 1);
    newSteps.splice(hoverIndex, 0, dragStep);

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: newSteps,
    });

    toast({
      title: "Step Reordered",
      description: "Workflow step order has been updated.",
    });
  };

  const handleMoveStep = (stepId: string, direction: 'up' | 'down') => {
    if (!currentWorkflow) return;
    
    const currentIndex = currentWorkflow.steps.findIndex(step => step.id === stepId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= currentWorkflow.steps.length) return;

    reorderSteps(currentIndex, newIndex);
  };

  const handleDeleteStep = (stepId: string) => {
    if (!currentWorkflow) return;

    const updatedSteps = currentWorkflow.steps.filter(step => step.id !== stepId);
    setCurrentWorkflow({
      ...currentWorkflow,
      steps: updatedSteps,
    });

    toast({
      title: "Step Deleted",
      description: "Workflow step has been removed.",
    });
  };

  const handleUpdateStep = (stepId: string, config: any, name?: string) => {
    if (!currentWorkflow) return;

    const updatedSteps = currentWorkflow.steps.map(step => 
      step.id === stepId 
        ? { ...step, config, ...(name && { name }) }
        : step
    );

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: updatedSteps,
    });

    toast({
      title: "Step Updated",
      description: "Workflow step has been configured.",
    });
  };

  const saveWorkflow = () => {
    if (!currentWorkflow) return;

    const updatedWorkflows = workflows.filter(w => w.id !== currentWorkflow.id);
    setWorkflows([...updatedWorkflows, currentWorkflow]);
    setIsEditing(false);

    toast({
      title: "Workflow Saved",
      description: `"${currentWorkflow.name}" has been saved successfully.`,
    });
  };

  const executeWorkflow = (workflow: Workflow) => {
    toast({
      title: "Workflow Started",
      description: `"${workflow.name}" is now executing...`,
    });

    const updatedWorkflow = { ...workflow, lastRun: new Date().toISOString() };
    const updatedWorkflows = workflows.map(w => w.id === workflow.id ? updatedWorkflow : w);
    setWorkflows(updatedWorkflows);

    if (currentWorkflow?.id === workflow.id) {
      setCurrentWorkflow(updatedWorkflow);
    }
  };

  const openWorkflow = (workflow: Workflow) => {
    setCurrentWorkflow(workflow);
    setIsEditing(false);
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Workflow Builder</h1>
          <p className="text-sm text-gray-600">Create complex, multi-step automation sequences</p>
        </div>
        <Button onClick={createNewWorkflow} className="bg-gray-900 hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <Tabs defaultValue="builder" className="h-full">
        <div className="bg-white border-b px-6">
          <TabsList className="bg-transparent border-0 p-0 h-auto">
            <TabsTrigger 
              value="builder" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none rounded-none pb-4"
            >
              Workflow Designer
            </TabsTrigger>
            <TabsTrigger 
              value="library"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-900 data-[state=active]:shadow-none rounded-none pb-4"
            >
              Workflow Library
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="builder" className="p-0 m-0 h-full">
          {currentWorkflow ? (
            <div className="flex h-full">
              {/* Main Canvas */}
              <div className="flex-1 p-6">
                <Card className="h-full">
                  <CardHeader className="border-b bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-2">
                        {isEditing ? (
                          <>
                            <Input
                              value={currentWorkflow.name}
                              onChange={(e) => setCurrentWorkflow({
                                ...currentWorkflow,
                                name: e.target.value,
                              })}
                              className="text-xl font-semibold border-0 shadow-none p-0 h-auto bg-transparent"
                              placeholder="Workflow name"
                            />
                            <Textarea
                              value={currentWorkflow.description}
                              onChange={(e) => setCurrentWorkflow({
                                ...currentWorkflow,
                                description: e.target.value,
                              })}
                              placeholder="Workflow description..."
                              className="text-sm border-0 shadow-none p-0 bg-transparent resize-none"
                              rows={2}
                            />
                          </>
                        ) : (
                          <>
                            <CardTitle className="text-xl">{currentWorkflow.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {currentWorkflow.description || 'No description'}
                            </CardDescription>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button onClick={saveWorkflow} size="sm">
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                              <Settings className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" onClick={() => executeWorkflow(currentWorkflow)}>
                              <Play className="w-4 h-4 mr-2" />
                              Run
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8">
                    {currentWorkflow.steps.length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                        <GitBranch className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Empty Workflow</h3>
                        <p className="text-gray-500 mb-6">Add steps from the panel to build your workflow</p>
                        {isEditing && (
                          <Button variant="outline" onClick={() => addStep('action')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Step
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 max-w-2xl">
                        {currentWorkflow.steps.map((step, index) => {
                          const stepTypeInfo = stepTypes.find(t => t.type === step.type);
                          const Icon = stepTypeInfo?.icon || Play;

                          return (
                            <div key={step.id}>
                              <Draggable
                                id={step.id}
                                index={index}
                                onReorder={reorderSteps}
                                disabled={!isEditing}
                              >
                                <div className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                  <div className={`p-3 rounded-lg ${stepTypeInfo?.color} text-white flex-shrink-0`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900">{step.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {step.description || stepTypeInfo?.description}
                                    </p>
                                    <Badge variant="outline" className="mt-2">
                                      {stepTypeInfo?.name}
                                    </Badge>
                                  </div>
                                  
                                  {isEditing && (
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
                                        disabled={index === currentWorkflow.steps.length - 1}
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
                                  )}
                                </div>
                              </Draggable>
                              
                              {index < currentWorkflow.steps.length - 1 && (
                                <div className="flex justify-center my-2">
                                  <ArrowRight className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="w-80 border-l bg-white p-6 space-y-6">
                {/* Add Steps Panel */}
                {isEditing && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Steps</h3>
                    <p className="text-sm text-gray-600 mb-4">Click to add workflow steps</p>
                    <div className="space-y-3">
                      {stepTypes.map((stepType) => {
                        const Icon = stepType.icon;
                        return (
                          <Button
                            key={stepType.type}
                            variant="outline"
                            className="w-full justify-start h-auto p-4"
                            onClick={() => addStep(stepType.type)}
                          >
                            <div className={`p-2 rounded mr-3 ${stepType.color} text-white flex-shrink-0`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="text-left flex-1">
                              <div className="font-medium text-gray-900">{stepType.name}</div>
                              <div className="text-xs text-gray-500">{stepType.description}</div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Workflow Info Panel */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Info</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Steps:</span>
                      <span className="font-medium">{currentWorkflow.steps.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={currentWorkflow.status === 'active' ? 'default' : 'secondary'}>
                        {currentWorkflow.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-900">{new Date(currentWorkflow.created).toLocaleDateString()}</span>
                    </div>
                    {currentWorkflow.lastRun && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Last Run:</span>
                        <span className="text-gray-900">{new Date(currentWorkflow.lastRun).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <Card>
                <CardContent className="text-center py-16">
                  <GitBranch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Workflow Selected</h3>
                  <p className="text-gray-500 mb-6">Create a new workflow to get started.</p>
                  <Button onClick={createNewWorkflow}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Workflow
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="library" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    {workflow.name}
                    <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{workflow.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Steps:</span>
                      <span>{workflow.steps.length}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span>{new Date(workflow.created).toLocaleDateString()}</span>
                    </div>
                    
                    {workflow.lastRun && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Run:</span>
                        <span>{new Date(workflow.lastRun).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => openWorkflow(workflow)}
                        className="flex-1"
                      >
                        Open
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => executeWorkflow(workflow)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {workflows.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-16">
                  <GitBranch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Workflows Yet</h3>
                  <p className="text-gray-500 mb-6">Create your first workflow to automate complex processes.</p>
                  <Button onClick={createNewWorkflow}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Workflow
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <StepConfigDialog
        step={editingStep}
        isOpen={!!editingStep}
        onClose={() => setEditingStep(null)}
        onSave={handleUpdateStep}
      />
    </div>
  );
};
