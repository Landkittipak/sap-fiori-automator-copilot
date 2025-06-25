
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useDatabaseRunHistory } from '@/hooks/useDatabaseTaskExecution';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

export const AnalyticsDashboard = () => {
  const { runs } = useDatabaseRunHistory();

  // Calculate analytics
  const totalRuns = runs.length;
  const completedRuns = runs.filter(run => run.status === 'completed').length;
  const failedRuns = runs.filter(run => run.status === 'failed').length;
  const runningRuns = runs.filter(run => run.status === 'running').length;
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

  // Template usage data
  const templateUsage = runs.reduce((acc, run) => {
    const templateName = run.logs[0] || 'Unknown Task';
    acc[templateName] = (acc[templateName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const templateData = Object.entries(templateUsage).map(([name, count]) => ({
    name: name.substring(0, 20) + (name.length > 20 ? '...' : ''),
    count
  }));

  // Daily runs data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyRunsData = last7Days.map(date => {
    const dayRuns = runs.filter(run => 
      run.startTime.split('T')[0] === date
    );
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      runs: dayRuns.length,
      completed: dayRuns.filter(run => run.status === 'completed').length,
      failed: dayRuns.filter(run => run.status === 'failed').length,
    };
  });

  // Status distribution for pie chart
  const statusData = [
    { name: 'Completed', value: completedRuns, color: '#22c55e' },
    { name: 'Failed', value: failedRuns, color: '#ef4444' },
    { name: 'Running', value: runningRuns, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  const stats = [
    {
      title: 'Total Executions',
      value: totalRuns.toString(),
      icon: Activity,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: CheckCircle,
      change: successRate > 90 ? 'Excellent' : successRate > 70 ? 'Good' : 'Needs Improvement',
      changeType: successRate > 90 ? 'positive' as const : successRate > 70 ? 'neutral' as const : 'negative' as const,
    },
    {
      title: 'Avg. Duration',
      value: `${avgDuration.toFixed(1)}min`,
      icon: Clock,
      change: avgDuration < 3 ? 'Fast' : avgDuration < 5 ? 'Normal' : 'Slow',
      changeType: avgDuration < 3 ? 'positive' as const : avgDuration < 5 ? 'neutral' as const : 'negative' as const,
    },
    {
      title: 'Failed Tasks',
      value: failedRuns.toString(),
      icon: XCircle,
      change: failedRuns === 0 ? 'Perfect!' : `${Math.round((failedRuns/totalRuns)*100)}% failure rate`,
      changeType: failedRuns === 0 ? 'positive' as const : failedRuns < totalRuns * 0.1 ? 'neutral' as const : 'negative' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600">Performance insights and execution metrics</p>
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
                <p className={`text-xs mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Runs Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Daily Activity (Last 7 Days)
            </CardTitle>
            <CardDescription>Task executions by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyRunsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Status Distribution
            </CardTitle>
            <CardDescription>Current execution status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <RechartsPieChart data={statusData}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Template Usage</CardTitle>
          <CardDescription>Most frequently used automation templates</CardDescription>
        </CardHeader>
        <CardContent>
          {templateData.length > 0 ? (
            <div className="space-y-4">
              {templateData.slice(0, 5).map((template, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{template.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{template.count} runs</Badge>
                    <Progress 
                      value={(template.count / Math.max(...templateData.map(t => t.count))) * 100} 
                      className="w-20" 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No template usage data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
