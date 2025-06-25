
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Download,
  Target,
  Zap
} from 'lucide-react';
import { useDatabaseRunHistory } from '@/hooks/useDatabaseTaskExecution';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart as RechartsPieChart, 
  Cell 
} from 'recharts';
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';

export const AdvancedAnalyticsDashboard = () => {
  const { runs } = useDatabaseRunHistory();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      window.location.reload();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Filter runs by date range
  const filteredRuns = dateRange?.from && dateRange?.to 
    ? runs.filter(run => {
        const runDate = new Date(run.startTime);
        return runDate >= dateRange.from! && runDate <= dateRange.to!;
      })
    : runs;

  // Calculate advanced metrics
  const totalRuns = filteredRuns.length;
  const completedRuns = filteredRuns.filter(run => run.status === 'completed').length;
  const failedRuns = filteredRuns.filter(run => run.status === 'failed').length;
  const runningRuns = filteredRuns.filter(run => run.status === 'running').length;
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;

  // Performance metrics
  const completedRunsWithDuration = filteredRuns.filter(run => 
    run.status === 'completed' && run.endTime
  );
  
  const avgDuration = completedRunsWithDuration.length > 0 
    ? completedRunsWithDuration.reduce((acc, run) => {
        const start = new Date(run.startTime).getTime();
        const end = new Date(run.endTime!).getTime();
        return acc + (end - start);
      }, 0) / completedRunsWithDuration.length / 1000 / 60
    : 0;

  const p95Duration = completedRunsWithDuration.length > 0
    ? (() => {
        const durations = completedRunsWithDuration.map(run => {
          const start = new Date(run.startTime).getTime();
          const end = new Date(run.endTime!).getTime();
          return (end - start) / 1000 / 60;
        }).sort((a, b) => a - b);
        const p95Index = Math.floor(durations.length * 0.95);
        return durations[p95Index] || 0;
      })()
    : 0;

  // SLA tracking (assuming 5 minute SLA)
  const slaThreshold = 5; // minutes
  const slaViolations = completedRunsWithDuration.filter(run => {
    const start = new Date(run.startTime).getTime();
    const end = new Date(run.endTime!).getTime();
    return (end - start) / 1000 / 60 > slaThreshold;
  }).length;

  const slaCompliance = completedRunsWithDuration.length > 0 
    ? Math.round(((completedRunsWithDuration.length - slaViolations) / completedRunsWithDuration.length) * 100)
    : 100;

  // Hourly performance data
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourRuns = filteredRuns.filter(run => {
      const runHour = new Date(run.startTime).getHours();
      return runHour === hour;
    });
    
    const hourCompleted = hourRuns.filter(run => run.status === 'completed').length;
    const hourFailed = hourRuns.filter(run => run.status === 'failed').length;
    const hourAvgDuration = hourRuns.length > 0
      ? hourRuns.reduce((acc, run) => {
          if (run.endTime) {
            const start = new Date(run.startTime).getTime();
            const end = new Date(run.endTime).getTime();
            return acc + (end - start) / 1000 / 60;
          }
          return acc;
        }, 0) / hourRuns.length
      : 0;

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      total: hourRuns.length,
      completed: hourCompleted,
      failed: hourFailed,
      avgDuration: Math.round(hourAvgDuration * 10) / 10,
      successRate: hourRuns.length > 0 ? Math.round((hourCompleted / hourRuns.length) * 100) : 0
    };
  });

  // Template performance analysis
  const templatePerformance = (() => {
    const templateStats = filteredRuns.reduce((acc, run) => {
      const templateName = run.logs[0] || 'Unknown Task';
      if (!acc[templateName]) {
        acc[templateName] = {
          name: templateName,
          total: 0,
          completed: 0,
          failed: 0,
          totalDuration: 0,
          completedDuration: 0
        };
      }
      
      acc[templateName].total++;
      if (run.status === 'completed') {
        acc[templateName].completed++;
        if (run.endTime) {
          const duration = (new Date(run.endTime).getTime() - new Date(run.startTime).getTime()) / 1000 / 60;
          acc[templateName].totalDuration += duration;
          acc[templateName].completedDuration += duration;
        }
      } else if (run.status === 'failed') {
        acc[templateName].failed++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(templateStats).map((template: any) => ({
      ...template,
      successRate: template.total > 0 ? Math.round((template.completed / template.total) * 100) : 0,
      avgDuration: template.completed > 0 ? Math.round((template.completedDuration / template.completed) * 10) / 10 : 0
    })).sort((a: any, b: any) => b.total - a.total);
  })();

  const exportAnalytics = () => {
    const analyticsData = {
      summary: {
        totalExecutions: totalRuns,
        completedExecutions: completedRuns,
        failedExecutions: failedRuns,
        successRate,
        avgDuration: Math.round(avgDuration * 100) / 100,
        p95Duration: Math.round(p95Duration * 100) / 100,
        slaCompliance,
        slaViolations
      },
      hourlyPerformance: hourlyData,
      templatePerformance,
      period: dateRange ? `${dateRange.from?.toISOString()} to ${dateRange.to?.toISOString()}` : 'All time'
    };

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusData = [
    { name: 'Completed', value: completedRuns, color: '#22c55e' },
    { name: 'Failed', value: failedRuns, color: '#ef4444' },
    { name: 'Running', value: runningRuns, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Comprehensive performance insights and metrics</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <DatePickerWithRange 
            value={dateRange} 
            onChange={setDateRange}
            placeholder="Select date range"
          />
          
          <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">1m</SelectItem>
              <SelectItem value="300">5m</SelectItem>
              <SelectItem value="900">15m</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Auto Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalRuns}</div>
            <p className="text-xs text-gray-600 mt-1">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{successRate}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{avgDuration.toFixed(1)}m</div>
            <p className="text-xs text-gray-600 mt-1">Mean execution time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">P95 Duration</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{p95Duration.toFixed(1)}m</div>
            <p className="text-xs text-gray-600 mt-1">95th percentile</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">SLA Compliance</CardTitle>
            <Target className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{slaCompliance}%</div>
            <p className="text-xs text-gray-600 mt-1">&lt; {slaThreshold}min target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed Tasks</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{failedRuns}</div>
            <p className="text-xs text-red-600 mt-1">{slaViolations} SLA violations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Performance</CardTitle>
                <CardDescription>Task execution patterns throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
                <CardDescription>Average duration by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="avgDuration" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Avg Duration (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Success Rate Trend</CardTitle>
              <CardDescription>Success rate by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    fillOpacity={0.3}
                    name="Success Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Performance Analysis</CardTitle>
              <CardDescription>Success rates and performance by template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templatePerformance.slice(0, 10).map((template: any, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">
                        {template.total} executions • {template.avgDuration}min avg
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={template.successRate > 90 ? "default" : template.successRate > 70 ? "secondary" : "destructive"}
                      >
                        {template.successRate}% success
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium">{template.completed}/{template.total}</div>
                        <div className="text-xs text-gray-500">completed</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Heatmap</CardTitle>
              <CardDescription>Task execution volume by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-1">
                {hourlyData.map((hour, index) => (
                  <div
                    key={index}
                    className={`
                      aspect-square rounded flex items-center justify-center text-xs font-medium
                      ${hour.total === 0 ? 'bg-gray-100 text-gray-400' :
                        hour.total <= 2 ? 'bg-blue-100 text-blue-800' :
                        hour.total <= 5 ? 'bg-blue-200 text-blue-900' :
                        hour.total <= 10 ? 'bg-blue-400 text-white' :
                        'bg-blue-600 text-white'}
                    `}
                    title={`${hour.hour}: ${hour.total} tasks`}
                  >
                    {hour.total}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                </div>
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
