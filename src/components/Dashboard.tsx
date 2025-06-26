import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  FileText, 
  Clock, 
  CheckCircle,
  Play,
  TrendingUp,
  Settings,
  Activity,
  Zap,
  Monitor
} from 'lucide-react';
import { useDatabaseRunHistory } from '@/hooks/useDatabaseTaskExecution';
import { CuaAgentManager } from '@/components/cua/CuaAgentManager';
import { CuaQuickTasks } from '@/components/cua/CuaQuickTasks';
import { CuaStatusMonitor } from '@/components/cua/CuaStatusMonitor';
import { useState, useEffect } from 'react';
import { cuaWorkflowService, CuaAgent, CuaTask } from '@/services/CuaWorkflowService';
import { useToast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const { runs } = useDatabaseRunHistory();
  const { toast } = useToast();
  const [agents, setAgents] = useState<CuaAgent[]>([]);
  const [tasks, setTasks] = useState<CuaTask[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeCua();
  }, []);

  const initializeCua = async () => {
    try {
      setLoading(true);
      
      // Check backend connection
      const isHealthy = await cuaWorkflowService.healthCheck();
      setIsBackendConnected(isHealthy);
      
      if (isHealthy) {
        // Connect WebSocket for real-time updates
        cuaWorkflowService.connectWebSocket();
        
        // Subscribe to status updates
        cuaWorkflowService.onStatusUpdate((status) => {
          if (status.type === 'status_update') {
            loadData();
          }
        });
        
        // Load initial data
        await loadData();
      } else {
        toast({
          title: "CUA Backend Unavailable",
          description: "Please start the CUA backend service",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initializing CUA:', error);
      toast({
        title: "CUA Initialization Failed",
        description: "Failed to connect to CUA backend",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [agentsData, tasksData] = await Promise.all([
        cuaWorkflowService.getAgents(),
        cuaWorkflowService.getTasks()
      ]);
      setAgents(agentsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Calculate real stats from actual data
  const totalRuns = runs.length;
  const completedRuns = runs.filter(run => run.status === 'completed').length;
  const failedRuns = runs.filter(run => run.status === 'failed').length;
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;

  // Calculate average duration
  const completedRunsWithDuration = runs.filter(run => 
    run.status === 'completed' && run.endTime
  );
  const avgDuration = completedRunsWithDuration.length > 0 
    ? completedRunsWithDuration.reduce((acc, run) => {
        const start = new Date(run.startTime).getTime();
        const end = new Date(run.endTime!).getTime();
        return acc + (end - start);
      }, 0) / completedRunsWithDuration.length / 1000 / 60 // Convert to minutes
    : 0;

  // Template usage count
  const templateUsage = runs.reduce((acc, run) => {
    const templateName = run.logs[0] || 'Unknown Task';
    acc[templateName] = (acc[templateName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const templateCount = Object.keys(templateUsage).length;

  // CUA-specific stats
  const activeAgents = agents.filter(agent => agent.status === 'running').length;
  const completedCuaTasks = tasks.filter(task => task.status === 'completed').length;
  const failedCuaTasks = tasks.filter(task => task.status === 'failed').length;
  const cuaSuccessRate = tasks.length > 0 ? Math.round((completedCuaTasks / tasks.length) * 100) : 0;

  const stats = [
    { 
      title: 'Total Tasks', 
      value: (totalRuns + tasks.length).toString(), 
      change: '+12%', 
      icon: Bot 
    },
    { 
      title: 'CUA Agents', 
      value: `${activeAgents}/${agents.length}`, 
      change: activeAgents > 0 ? 'Active' : 'Idle', 
      icon: Activity 
    },
    { 
      title: 'Success Rate', 
      value: `${cuaSuccessRate}%`, 
      change: cuaSuccessRate > 90 ? 'Excellent' : 'Good', 
      icon: CheckCircle 
    },
    { 
      title: 'Avg. Duration', 
      value: `${avgDuration.toFixed(1)}min`, 
      change: avgDuration < 3 ? 'Fast' : 'Normal', 
      icon: Clock 
    },
  ];

  const recentRuns = runs.slice(0, 4).map((run, index) => ({
    id: index + 1,
    task: run.logs[0] || 'SAP Automation Task',
    status: run.status,
    duration: run.endTime 
      ? `${Math.round((new Date(run.endTime).getTime() - new Date(run.startTime).getTime()) / 1000 / 60 * 10) / 10}min`
      : 'Running...',
    timestamp: new Date(run.startTime).toLocaleString()
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running':
        return <Badge className="bg-yellow-100 text-yellow-800">Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600">Monitor your SAP automation tasks and manage your CUA agents</p>
        
        {/* CUA Backend Status */}
        <div className="mt-4">
          <Badge variant={isBackendConnected ? "default" : "destructive"}>
            {isBackendConnected ? "🟢 CUA Backend Connected" : "🔴 CUA Backend Disconnected"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cua">CUA Agents</TabsTrigger>
          <TabsTrigger value="quick-tasks">Quick Tasks</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-green-600 mt-1">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Run common SAP tasks with CUA agents</CardDescription>
              </CardHeader>
              <CardContent>
                <CuaQuickTasks />
              </CardContent>
            </Card>

            {/* Recent Runs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Runs</CardTitle>
                <CardDescription>Latest automation task executions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRuns.length > 0 ? recentRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {run.task}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(run.status)}
                          <span className="text-xs text-gray-500">{run.duration}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{run.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No recent executions</p>
                      <p className="text-sm">Start by submitting a task</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cua">
          <CuaAgentManager />
        </TabsContent>

        <TabsContent value="quick-tasks">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">CUA Quick Tasks</h2>
              <p className="text-muted-foreground">
                Execute common SAP automation tasks with natural language
              </p>
            </div>
            <CuaQuickTasks />
          </div>
        </TabsContent>

        <TabsContent value="monitor">
          <CuaStatusMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};
