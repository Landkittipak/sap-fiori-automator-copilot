import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Square, 
  RefreshCw,
  Monitor,
  Bot,
  Zap
} from 'lucide-react';
import { cuaWorkflowService, CuaAgent, CuaTask, CuaStatus } from '@/services/CuaWorkflowService';
import { useToast } from '@/hooks/use-toast';

export function CuaStatusMonitor() {
  const [agents, setAgents] = useState<CuaAgent[]>([]);
  const [tasks, setTasks] = useState<CuaTask[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<CuaStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    setupWebSocket();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    
    return () => {
      clearInterval(interval);
      cuaWorkflowService.disconnect();
    };
  }, []);

  const setupWebSocket = () => {
    cuaWorkflowService.connectWebSocket();
    cuaWorkflowService.onStatusUpdate((status) => {
      setStatusUpdates(prev => [status, ...prev.slice(0, 49)]); // Keep last 50 updates
      if (status.type === 'status_update') {
        loadData();
      }
    });
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [agentsData, tasksData] = await Promise.all([
        cuaWorkflowService.getAgents(),
        cuaWorkflowService.getTasks()
      ]);
      setAgents(agentsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load CUA status data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'idle':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Monitor className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-100 text-green-800">Running</Badge>;
      case 'idle':
        return <Badge variant="secondary">Idle</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const calculateSuccessRate = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getActiveTasks = () => tasks.filter(task => task.status === 'running');
  const getRecentTasks = () => tasks.slice(0, 10); // Last 10 tasks

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CUA Status Monitor</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of CUA agents and task execution
          </p>
        </div>
        <Button onClick={loadData} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">
              {agents.filter(a => a.status === 'running').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {getActiveTasks().length} running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateSuccessRate()}%</div>
            <Progress value={calculateSuccessRate()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Updates</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusUpdates.length}</div>
            <p className="text-xs text-muted-foreground">
              Real-time updates
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="updates">Live Updates ({statusUpdates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          {agents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32">
                <Bot className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No agents found</p>
                <p className="text-sm text-muted-foreground">Create your first agent to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {agents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(agent.status)}
                        <CardTitle className="text-lg">{agent.id}</CardTitle>
                      </div>
                      {getStatusBadge(agent.status)}
                    </div>
                    <CardDescription>
                      Created {new Date(agent.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {agent.current_task && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Current Task:</p>
                        <p className="text-sm text-muted-foreground">{agent.current_task}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32">
                <Zap className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No tasks found</p>
                <p className="text-sm text-muted-foreground">Execute a task to see it here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getRecentTasks().map((task) => (
                <Card key={task.task_id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <CardTitle className="text-lg">{task.task}</CardTitle>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>
                    <CardDescription>
                      Started {new Date(task.start_time).toLocaleString()}
                      {task.end_time && ` • Duration: ${getDuration(task.start_time, task.end_time)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {task.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">Error: {task.error}</p>
                      </div>
                    )}
                    {task.result && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Result:</p>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(task.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          {statusUpdates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32">
                <Monitor className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No live updates</p>
                <p className="text-sm text-muted-foreground">Updates will appear here in real-time</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {statusUpdates.map((update, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {update.type}
                      </Badge>
                      <span className="text-sm font-medium">
                        {update.task_id ? `Task ${update.task_id}` : 'System Update'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  {update.error && (
                    <p className="text-sm text-red-600 mt-1">{update.error}</p>
                  )}
                  {update.result && (
                    <p className="text-sm text-green-600 mt-1">Task completed successfully</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 