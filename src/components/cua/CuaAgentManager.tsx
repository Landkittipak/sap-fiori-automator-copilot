import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import CuaService from '@/services/CuaService';
import { Play, Square, Plus, Settings, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';

// Create a singleton instance
const cuaService = new CuaService();

interface CuaAgent {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

interface CuaWorkspace {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export function CuaAgentManager() {
  const [agents, setAgents] = useState<CuaAgent[]>([]);
  const [workspaces, setWorkspaces] = useState<CuaWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [executingTask, setExecutingTask] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agentsData, workspacesData] = await Promise.all([
        cuaService.getAgents(),
        cuaService.getWorkspaces()
      ]);
      setAgents(agentsData);
      setWorkspaces(workspacesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load C/ua data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    if (!newAgentName.trim()) {
      toast({
        title: "Error",
        description: "Agent name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingAgent(true);
      const newAgent = await cuaService.createAgent(newAgentName, selectedWorkspace || undefined);
      setAgents(prev => [...prev, newAgent]);
      setNewAgentName('');
      setSelectedWorkspace('');
      toast({
        title: "Success",
        description: `Agent "${newAgent.name}" created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create agent",
        variant: "destructive",
      });
    } finally {
      setCreatingAgent(false);
    }
  };

  const startAgent = async (agentId: string) => {
    try {
      const updatedAgent = await cuaService.startAgent(agentId);
      setAgents(prev => prev.map(agent => 
        agent.id === agentId ? updatedAgent : agent
      ));
      toast({
        title: "Success",
        description: "Agent started successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start agent",
        variant: "destructive",
      });
    }
  };

  const stopAgent = async (agentId: string) => {
    try {
      const updatedAgent = await cuaService.stopAgent(agentId);
      setAgents(prev => prev.map(agent => 
        agent.id === agentId ? updatedAgent : agent
      ));
      toast({
        title: "Success",
        description: "Agent stopped successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop agent",
        variant: "destructive",
      });
    }
  };

  const executeTask = async () => {
    if (!selectedAgent || !taskInput.trim()) {
      toast({
        title: "Error",
        description: "Please select an agent and enter a task",
        variant: "destructive",
      });
      return;
    }

    try {
      setExecutingTask(selectedAgent);
      const result = await cuaService.executeTask(selectedAgent, taskInput);
      toast({
        title: "Success",
        description: "Task executed successfully",
      });
      setTaskInput('');
      setSelectedAgent(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute task",
        variant: "destructive",
      });
    } finally {
      setExecutingTask(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-green-100 text-green-800">Running</Badge>;
      case 'stopped':
        return <Badge variant="secondary">Stopped</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">C/ua Agent Manager</h2>
          <p className="text-muted-foreground">
            Manage your AI agents for SAP Fiori automation
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Create a new C/ua agent for automation tasks
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="Enter agent name"
                />
              </div>
              <div>
                <Label htmlFor="workspace">Workspace (Optional)</Label>
                <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((workspace) => (
                      <SelectItem key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={createAgent} 
                disabled={creatingAgent || !newAgentName.trim()}
                className="w-full"
              >
                {creatingAgent ? 'Creating...' : 'Create Agent'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                {getStatusIcon(agent.status)}
              </div>
              <CardDescription>
                Created {new Date(agent.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {getStatusBadge(agent.status)}
                </div>
                
                <div className="flex gap-2">
                  {agent.status === 'stopped' ? (
                    <Button
                      size="sm"
                      onClick={() => startAgent(agent.id)}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => stopAgent(agent.id)}
                      className="flex-1"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Execute Task</DialogTitle>
                        <DialogDescription>
                          Send a task to agent: {agent.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="task-input">Task Description</Label>
                          <Textarea
                            id="task-input"
                            value={taskInput}
                            onChange={(e) => setTaskInput(e.target.value)}
                            placeholder="Describe the task you want the agent to perform..."
                            rows={4}
                          />
                        </div>
                        <Button 
                          onClick={executeTask}
                          disabled={executingTask === agent.id || !taskInput.trim()}
                          className="w-full"
                        >
                          {executingTask === agent.id ? 'Executing...' : 'Execute Task'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {agents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Settings className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No agents found</p>
            <p className="text-sm text-muted-foreground">Create your first agent to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 