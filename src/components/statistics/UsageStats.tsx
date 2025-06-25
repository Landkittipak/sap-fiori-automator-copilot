
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Users
} from 'lucide-react';

interface StatsData {
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  templatesUsed: number;
  workflowsRun: number;
  recentActivity: Array<{
    date: string;
    executions: number;
    success: number;
    failed: number;
  }>;
  topTemplates: Array<{
    name: string;
    uses: number;
    successRate: number;
  }>;
}

export const UsageStats = () => {
  const [stats, setStats] = useState<StatsData>({
    totalExecutions: 127,
    successRate: 94.5,
    avgExecutionTime: 2.3,
    templatesUsed: 8,
    workflowsRun: 15,
    recentActivity: [
      { date: '2024-01-20', executions: 12, success: 11, failed: 1 },
      { date: '2024-01-21', executions: 15, success: 14, failed: 1 },
      { date: '2024-01-22', executions: 8, success: 8, failed: 0 },
      { date: '2024-01-23', executions: 18, success: 17, failed: 1 },
      { date: '2024-01-24', executions: 22, success: 20, failed: 2 },
      { date: '2024-01-25', executions: 14, success: 13, failed: 1 },
      { date: '2024-01-26', executions: 19, success: 18, failed: 1 },
    ],
    topTemplates: [
      { name: 'Material Master Update', uses: 45, successRate: 96.7 },
      { name: 'Purchase Order Creation', uses: 32, successRate: 93.8 },
      { name: 'Inventory Check', uses: 28, successRate: 100 },
      { name: 'Price Update', uses: 22, successRate: 90.9 },
    ]
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const pieData = [
    { name: 'Successful', value: stats.totalExecutions * (stats.successRate / 100), color: '#10B981' },
    { name: 'Failed', value: stats.totalExecutions * (1 - stats.successRate / 100), color: '#EF4444' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Usage Statistics</h2>
        <p className="text-gray-600 dark:text-gray-400">Monitor your automation performance and usage patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Executions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalExecutions}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.avgExecutionTime}s</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Templates Used</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.templatesUsed}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Daily execution trends over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="success" fill="#10B981" name="Successful" />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution Results</CardTitle>
            <CardDescription>Overall success vs failure rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Most Used Templates</CardTitle>
          <CardDescription>Your most frequently executed templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topTemplates.map((template, index) => (
              <div key={template.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-500">{template.uses} executions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{template.successRate}%</p>
                  <Progress value={template.successRate} className="w-20 h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
