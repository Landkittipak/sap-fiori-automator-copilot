
import { useState, useCallback } from 'react';
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
  Trash2, 
  Settings, 
  GitBranch, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'delay' | 'approval';
  name: string;
  description: string;
  config: any;
  position: { x: number; y: number };
  connections: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: string[];
  status: 'draft' | 'active' | 'paused';
  created: string;
  lastRun?: string;
}

export const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
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
      triggers: ['manual'],
      status: 'draft',
      created: new Date().toISOString(),
    };
    setCurrentWorkflow(newWorkflow);
    setIsEditing(true);
  };

  const addStep = (stepType: string) => {
    if (!currentWorkflow) return;

    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: stepType as 'action' | 'condition' | 'delay' | 'approval',
      name: `New ${stepType}`,
      description: '',
      config: {},
      position: { x: 100 + currentWorkflow.steps.length * 200, y: 100 },
      connections: [],
    };

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: [...currentWorkflow.steps, newStep],
    });
  };

  const removeStep = (stepId: string) => {
    if (!currentWorkflow) return;

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: currentWorkflow.steps.filter(s => s.id !== stepId),
    });

    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
    }
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
    // Simulate workflow execution
    toast({
      title: "Workflow Started",
      description: `"${workflow.name}" is now executing...`,
    });

    // Update last run time
    const updatedWorkflow = { ...workflow, lastRun: new Date().toISOString() };
    const updatedWorkflows = workflows.map(w => w.id === workflow.id ? updatedWorkflow : w);
    setWorkflows(updatedWorkflows);

    if (currentWorkflow?.id === workflow.id) {
      setCurrentWorkflow(updatedWorkflow);
    }
  };

  const renderStep = (step: WorkflowStep) => {
    const stepTypeInfo = stepTypes.find(t => t.type === step.type);
    const Icon = stepTypeInfo?.icon || Play;

    return (
      <div
        key={step.id}
        className={`
          relative p-4 rounded-lg border-2 cursor-pointer transition-all
          ${selectedStep?.id === step.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}
        `}
        style={{
          position: 'absolute',
          left: step.position.x,
          top: step.position.y,
          width: 180,
        }}
        onClick={() => setSelectedStep(step)}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1 rounded ${stepTypeInfo?.color} text-white`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm">{step.name}</span>
        </div>
        
        <p className="text-xs text-gray-600 mb-2">{step.description || stepTypeInfo?.description}</p>
        
        <Badge variant="outline" className="text-xs">
          {stepTypeInfo?.name}
        </Badge>

        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              removeStep(step.id);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}

        {/* Connection points */}
        <div className="absolute -right-2 top-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full transform -translate-y-1/2"></div>
        <div className="absolute -left-2 top-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full transform -translate-y-1/2"></div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Builder</h2>
          <p className="text-gray-600">Create complex, multi-step automation sequences</p>
        </div>
        <Button onClick={createNewWorkflow}>
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder">Workflow Designer</TabsTrigger>
          <TabsTrigger value="library">Workflow Library</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {currentWorkflow ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Workflow Canvas */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{currentWorkflow.name}</CardTitle>
                      <CardDescription>{currentWorkflow.description || 'No description'}</CardDescription>
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
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-96 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                      {/* Canvas Background */}
                      <div className="absolute inset-0 bg-gray-50">
                        {/* Grid Pattern */}
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: 'radial-gradient(circle, #666 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }}
                        />
                      </div>

                      {/* Workflow Steps */}
                      {currentWorkflow.steps.map(renderStep)}

                      {/* Connections */}
                      {currentWorkflow.steps.map(step => 
                        step.connections.map(connectionId => {
                          const targetStep = currentWorkflow.steps.find(s => s.id === connectionId);
                          if (!targetStep) return null;

                          return (
                            <svg
                              key={`${step.id}-${connectionId}`}
                              className="absolute inset-0 pointer-events-none"
                              style={{ zIndex: 1 }}
                            >
                              <defs>
                                <marker
                                  id="arrowhead"
                                  markerWidth="10"
                                  markerHeight="7"
                                  refX="10"
                                  refY="3.5"
                                  orient="auto"
                                >
                                  <polygon
                                    points="0 0, 10 3.5, 0 7"
                                    fill="#6b7280"
                                  />
                                </marker>
                              </defs>
                              <line
                                x1={step.position.x + 180}
                                y1={step.position.y + 50}
                                x2={targetStep.position.x}
                                y2={targetStep.position.y + 50}
                                stroke="#6b7280"
                                strokeWidth="2"
                                markerEnd="url(#arrowhead)"
                              />
                            </svg>
                          );
                        })
                      )}

                      {/* Empty State */}
                      {currentWorkflow.steps.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Empty Workflow</p>
                            <p className="text-sm">Add steps from the panel to build your workflow</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Properties Panel */}
              <div className="space-y-6">
                {/* Workflow Properties */}
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="workflow-name">Name</Label>
                      <Input
                        id="workflow-name"
                        value={currentWorkflow.name}
                        onChange={(e) => setCurrentWorkflow({
                          ...currentWorkflow,
                          name: e.target.value,
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="workflow-description">Description</Label>
                      <Textarea
                        id="workflow-description"
                        value={currentWorkflow.description}
                        onChange={(e) => setCurrentWorkflow({
                          ...currentWorkflow,
                          description: e.target.value,
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Badge 
                        variant={currentWorkflow.status === 'active' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {currentWorkflow.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Step Types */}
                {isEditing && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Steps</CardTitle>
                      <CardDescription>Drag or click to add workflow steps</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {stepTypes.map((stepType) => {
                          const Icon = stepType.icon;
                          return (
                            <Button
                              key={stepType.type}
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => addStep(stepType.type)}
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

                {/* Step Properties */}
                {selectedStep && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Step Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Step Name</Label>
                        <Input
                          value={selectedStep.name}
                          onChange={(e) => {
                            const updatedStep = { ...selectedStep, name: e.target.value };
                            setSelectedStep(updatedStep);
                            
                            if (currentWorkflow) {
                              setCurrentWorkflow({
                                ...currentWorkflow,
                                steps: currentWorkflow.steps.map(s => 
                                  s.id === selectedStep.id ? updatedStep : s
                                ),
                              });
                            }
                          }}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={selectedStep.description}
                          onChange={(e) => {
                            const updatedStep = { ...selectedStep, description: e.target.value };
                            setSelectedStep(updatedStep);
                            
                            if (currentWorkflow) {
                              setCurrentWorkflow({
                                ...currentWorkflow,
                                steps: currentWorkflow.steps.map(s => 
                                  s.id === selectedStep.id ? updatedStep : s
                                ),
                              });
                            }
                          }}
                          disabled={!isEditing}
                        />
                      </div>

                      <div>
                        <Label>Step Type</Label>
                        <Badge variant="outline" className="ml-2">
                          {stepTypes.find(t => t.type === selectedStep.type)?.name}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflow Selected</h3>
                <p className="text-gray-500 mb-4">Create a new workflow or select an existing one to get started.</p>
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

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Data Migration Workflow',
                description: 'Multi-step data migration with validation and rollback',
                steps: ['Extract Data', 'Validate', 'Transform', 'Load', 'Verify'],
              },
              {
                name: 'Approval Process',
                description: 'Sequential approval workflow with escalation',
                steps: ['Request', 'Manager Approval', 'Finance Approval', 'Execute'],
              },
              {
                name: 'Error Handling Pipeline',
                description: 'Robust error handling with retry and notification',
                steps: ['Execute', 'Check Result', 'Retry on Fail', 'Notify', 'Escalate'],
              },
            ].map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Workflow Steps:</div>
                    <div className="space-y-1">
                      {template.steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </div>
                          <span>{step}</span>
                          {idx < template.steps.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-gray-400 ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4" onClick={createNewWorkflow}>
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
