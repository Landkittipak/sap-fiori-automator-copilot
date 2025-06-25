
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  FileText, 
  Clock, 
  CheckCircle,
  XCircle,
  Play,
  BarChart3,
  Store,
  Layers,
  Download,
  User,
  TrendingUp
} from 'lucide-react';
import { useDatabaseRunHistory } from '@/hooks/useDatabaseTaskExecution';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';
import { TemplateMarketplace } from './marketplace/TemplateMarketplace';
import { BulkOperations } from './bulk/BulkOperations';
import { ExportFunctionality } from './export/ExportFunctionality';

export const Dashboard = () => {
  const { runs } = useDatabaseRunHistory();

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

  const stats = [
    { title: 'Total Tasks', value: totalRuns.toString(), change: '+12%', icon: Bot },
    { title: 'Templates Used', value: templateCount.toString(), change: `${templateCount} types`, icon: FileText },
    { title: 'Success Rate', value: `${successRate}%`, change: successRate > 90 ? 'Excellent' : 'Good', icon: CheckCircle },
    { title: 'Avg. Duration', value: `${avgDuration.toFixed(1)}min`, change: avgDuration < 3 ? 'Fast' : 'Normal', icon: Clock },
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

  const quickActions = [
    { title: 'Stock Transfer', template: 'stock-transfer' },
    { title: 'Material Check', template: 'material-check' },
    { title: 'Lead Time Update', template: 'lead-time' },
    { title: 'Custom Task', template: null },
  ];

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

  return (
    <div className="p-8">
      <Tabs defaultValue="overview" className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600">Monitor your SAP automation tasks and access advanced features</p>
          </div>
          
          <TabsList className="grid grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-1">
              <Store className="w-3 h-3" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Bulk Ops
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              Export
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Profile
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Run common SAP tasks with pre-built templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="w-full justify-between"
                  >
                    <span>{action.title}</span>
                    <Play className="w-4 h-4" />
                  </Button>
                ))}
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

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Analytics
                </CardTitle>
                <CardDescription>Performance insights and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">View detailed analytics, success rates, and usage patterns.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-600" />
                  Marketplace
                </CardTitle>
                <CardDescription>Community templates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Discover and install automation templates from the community.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  Bulk Operations
                </CardTitle>
                <CardDescription>Execute multiple tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Run multiple automation tasks efficiently with CSV upload.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-orange-600" />
                  Export & Reports
                </CardTitle>
                <CardDescription>Download execution data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Export execution logs, analytics, and generate reports.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="marketplace">
          <TemplateMarketplace />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkOperations />
        </TabsContent>

        <TabsContent value="export">
          <ExportFunctionality />
        </TabsContent>

        <TabsContent value="profile">
          <div className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              <p className="text-muted-foreground mt-2">Profile functionality has been moved to Settings</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
