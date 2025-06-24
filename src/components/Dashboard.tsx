
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  FileText, 
  Clock, 
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';

export const Dashboard = () => {
  const stats = [
    { title: 'Total Tasks', value: '142', change: '+12%', icon: Bot },
    { title: 'Templates', value: '8', change: '+2', icon: FileText },
    { title: 'Success Rate', value: '94%', change: '+3%', icon: CheckCircle },
    { title: 'Avg. Duration', value: '2.4min', change: '-15%', icon: Clock },
  ];

  const recentRuns = [
    { id: 1, task: 'Stock Transfer: 100 FG100 from 1710 to 1010', status: 'completed', duration: '2.1min', timestamp: '2 minutes ago' },
    { id: 2, task: 'Material Master Update: Lead time for FG200', status: 'running', duration: '1.8min', timestamp: '5 minutes ago' },
    { id: 3, task: 'Stock Check: Material FG150 quantities', status: 'completed', duration: '1.2min', timestamp: '10 minutes ago' },
    { id: 4, task: 'Purchase Order: Create PO for vendor 1000', status: 'failed', duration: '3.2min', timestamp: '15 minutes ago' },
  ];

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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600">Monitor your SAP automation tasks and manage templates</p>
      </div>

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
                  {stat.change} from last week
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
              {recentRuns.map((run) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
