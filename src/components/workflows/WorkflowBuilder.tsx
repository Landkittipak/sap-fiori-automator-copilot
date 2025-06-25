
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
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Draggable } from '@/components/ui/draggable';

interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'delay' | 'approval';
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
      type: stepType as 'action' | 'condition' | 'delay' | 'approval',
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

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Builder</h2>
          <p className="text-gray-600">Create complex, multi-step automation sequences</p>
        </div>
        <Button onClick={createNewWorkflow} className="hover:scale-105 transition-transform">
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder">Workflow Designer</TabsTrigger>
          <TabsTrigger value="library">Workflow Library</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {currentWorkflow ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Workflow Canvas */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-2">
                      {isEditing ? (
                        <Input
                          value={currentWorkflow.name}
                          onChange={(e) => setCurrentWorkflow({
                            ...currentWorkflow,
                            name: e.target.value,
                          })}
                          className="text-lg font-semibold"
                        />
                      ) : (
                        <CardTitle>{currentWorkflow.name}</CardTitle>
                      )}
                      {isEditing ? (
                        <Textarea
                          value={currentWorkflow.description}
                          onChange={(e) => setCurrentWorkflow({
                            ...currentWorkflow,
                            description: e.target.value,
                          })}
                          placeholder="Workflow description..."
                          className="text-sm"
                        />
                      ) : (
                        <CardDescription>{currentWorkflow.description || 'No description'}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button onClick={saveWorkflow} size="sm" className="hover:scale-105 transition-transform">
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
                          <Button size="sm" onClick={() => executeWorkflow(currentWorkflow)} className="hover:scale-105 transition-transform">
                            <Play className="w-4 h-4 mr-2" />
                            Run
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Enhanced Workflow Steps with Drag & Drop */}
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
                              className="pl-6"
                            >
                              <div className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className={`p-2 rounded ${stepTypeInfo?.color} text-white`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{step.name}</h4>
                                  <p className="text-sm text-gray-600">{step.description || stepTypeInfo?.description}</p>
                                  <Badge variant="outline" className="mt-1">
                                    {stepTypeInfo?.name}
                                  </Badge>
                                </div>
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

                      {/* Enhanced Empty State */}
                      {currentWorkflow.steps.length === 0 && (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                          <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Empty Workflow</p>
                          <p className="text-sm mb-4">Add steps from the panel to build your workflow</p>
                          {isEditing && (
                            <Button variant="outline" onClick={() => addStep('action')}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Step
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Properties Panel */}
              <div className="space-y-6">
                {/* Step Types */}
                {isEditing && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Steps</CardTitle>
                      <CardDescription>Click to add workflow steps</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {stepTypes.map((stepType) => {
                          const Icon = stepType.icon;
                          return (
                            <Button
                              key={stepType.type}
                              variant="outline"
                              className="w-full justify-start hover:scale-105 transition-transform"
                              onClick={() => {
                                console.log('Adding step type:', stepType.type);
                                addStep(stepType.type);
                              }}
                            >
                              <div className={`p-1 rounded mr-3 ${stepType.color} text-white`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium">{stepType.name}</div>
                                <div className="text-xs text-gray-500">{stepType.description}</div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Enhanced Workflow Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Steps:</span>
                      <span className="font-medium">{currentWorkflow.steps.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <Badge variant={currentWorkflow.status === 'active' ? 'default' : 'secondary'}>
                        {currentWorkflow.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span>{new Date(currentWorkflow.created).toLocaleDateString()}</span>
                    </div>
                    {currentWorkflow.lastRun && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Run:</span>
                        <span>{new Date(currentWorkflow.lastRun).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflow Selected</h3>
                <p className="text-gray-500 mb-4">Create a new workflow to get started.</p>
                <Button onClick={createNewWorkflow}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Workflow
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
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
                        onClick={() => setCurrentWorkflow(workflow)}
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
                <CardContent className="text-center py-12">
                  <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflows Yet</h3>
                  <p className="text-gray-500 mb-4">Create your first workflow to automate complex processes.</p>
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
    </div>
  );
};
