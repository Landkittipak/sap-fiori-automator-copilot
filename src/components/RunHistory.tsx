
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Eye,
  Download
} from 'lucide-react';
import { useDatabaseRunHistory } from '@/hooks/useDatabaseTaskExecution';
import { useState } from 'react';

export const RunHistory = () => {
  const { runs, refreshRuns } = useDatabaseRunHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRuns = runs.filter(run => {
    const matchesSearch = run.logs[0]?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completed
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Failed
        </Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Play className="w-3 h-3" />
          Running
        </Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Queued
        </Badge>;
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'Running...';
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const duration = Math.round((end - start) / 1000 / 60 * 10) / 10;
    return `${duration}min`;
  };

  const getTaskName = (run: any) => {
    return run.logs[0] || 'SAP Automation Task';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-8 h-8" />
          Execution History
        </h1>
        <p className="text-gray-600">View and manage your automation task execution history</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search executions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={refreshRuns} variant="outline">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent Executions</TabsTrigger>
          <TabsTrigger value="all">All History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          {filteredRuns.slice(0, 10).length > 0 ? (
            filteredRuns.slice(0, 10).map((run) => (
              <Card key={run.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{getTaskName(run)}</CardTitle>
                    {getStatusBadge(run.status)}
                  </div>
                  <CardDescription>
                    Execution ID: {run.id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Started</p>
                      <p className="text-sm text-gray-600">
                        {new Date(run.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Duration</p>
                      <p className="text-sm text-gray-600">
                        {formatDuration(run.startTime, run.endTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Progress</p>
                      <p className="text-sm text-gray-600">{run.progress}%</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-1">Current Step</p>
                    <p className="text-sm text-gray-600">{run.currentStep}</p>
                  </div>

                  {run.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-700">{run.error}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {run.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No execution history found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start by submitting a task to see execution history here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredRuns.length > 0 ? (
            filteredRuns.map((run) => (
              <Card key={run.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{getTaskName(run)}</CardTitle>
                    {getStatusBadge(run.status)}
                  </div>
                  <CardDescription>
                    {new Date(run.startTime).toLocaleString()} • {formatDuration(run.startTime, run.endTime)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Progress: {run.progress}%</p>
                      <p className="text-sm text-gray-600">{run.currentStep}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No executions found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
