import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Download, 
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  RefreshCw,
  Play
} from 'lucide-react';
import { useDatabaseRunHistory } from '@/hooks/useDatabaseTaskExecution';
import { type RunStatus } from '@/services/DatabaseTaskExecutionService';

export const RunHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRun, setSelectedRun] = useState<RunStatus | null>(null);
  
  const { runs } = useDatabaseRunHistory();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'queued':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'queued':
        return <Badge className="bg-yellow-100 text-yellow-800">Queued</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'Running...';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getTaskDescription = (run: RunStatus) => {
    const firstLog = run.logs[0];
    return firstLog || 'SAP Automation Task';
  };

  const filteredRuns = runs.filter(run => {
    const taskDesc = getTaskDescription(run);
    const matchesSearch = taskDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         run.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeRuns = filteredRuns.filter(run => run.status === 'running' || run.status === 'queued');
  const completedRuns = filteredRuns.filter(run => run.status === 'completed' || run.status === 'failed');

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">History & Monitor</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and monitor your SAP automation executions in real-time</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tasks, run IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Active vs History */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Active ({activeRuns.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            History ({completedRuns.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Executions</CardTitle>
              <CardDescription>Currently running and queued tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {activeRuns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active executions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRuns.map((run) => (
                    <div key={run.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(run.status)}
                            <h3 className="font-medium text-gray-900 truncate">{getTaskDescription(run)}</h3>
                            <Badge variant="outline" className="text-xs">
                              {run.id}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(run.startTime).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(run.startTime, run.endTime)}</span>
                            </div>
                            <span>Progress: {run.progress}%</span>
                          </div>
                          {run.status === 'running' && (
                            <div className="mt-2">
                              <p className="text-sm text-blue-600">{run.currentStep}</p>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full transition-all"
                                  style={{ width: `${run.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(run.status)}
                          <div className="flex space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedRun(run)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Execution Details</DialogTitle>
                                  <DialogDescription>Run ID: {run.id}</DialogDescription>
                                </DialogHeader>
                                {selectedRun && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Task Details</h4>
                                        <div className="space-y-2 text-sm">
                                          <div><span className="font-medium">Task:</span> {getTaskDescription(selectedRun)}</div>
                                          <div><span className="font-medium">Status:</span> {getStatusBadge(selectedRun.status)}</div>
                                          <div><span className="font-medium">Current Step:</span> {selectedRun.currentStep}</div>
                                          <div><span className="font-medium">Progress:</span> {selectedRun.progress}%</div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">Timing</h4>
                                        <div className="space-y-2 text-sm">
                                          <div><span className="font-medium">Start:</span> {new Date(selectedRun.startTime).toLocaleString()}</div>
                                          {selectedRun.endTime && <div><span className="font-medium">End:</span> {new Date(selectedRun.endTime).toLocaleString()}</div>}
                                          <div><span className="font-medium">Duration:</span> {formatDuration(selectedRun.startTime, selectedRun.endTime)}</div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {selectedRun.error && (
                                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <h4 className="font-medium text-red-900 mb-2">Error</h4>
                                        <p className="text-red-700 text-sm">{selectedRun.error}</p>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <h4 className="font-medium mb-3">Execution Log</h4>
                                      <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                                        {selectedRun.logs.map((log, index) => (
                                          <div key={index} className="text-sm text-gray-700 mb-1">
                                            <span className="text-gray-500">{index + 1}.</span> {log}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-3">Screenshots ({selectedRun.screenshots.length})</h4>
                                      <div className="grid grid-cols-3 gap-4">
                                        {selectedRun.screenshots.map((screenshot, index) => (
                                          <div key={index} className="bg-gray-200 h-24 rounded border flex items-center justify-center text-sm text-gray-500">
                                            Step {index + 1}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>Completed and failed executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedRuns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No completed executions found.</p>
                    <p className="text-sm">Start by submitting a task from the Task Submission page.</p>
                  </div>
                ) : (
                  completedRuns.map((run) => (
                    <div key={run.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(run.status)}
                            <h3 className="font-medium text-gray-900 truncate">{getTaskDescription(run)}</h3>
                            <Badge variant="outline" className="text-xs">
                              {run.id}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(run.startTime).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(run.startTime, run.endTime)}</span>
                            </div>
                            <span>Progress: {run.progress}%</span>
                          </div>
                          {run.status === 'running' && (
                            <div className="mt-2">
                              <p className="text-sm text-blue-600">{run.currentStep}</p>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full transition-all"
                                  style={{ width: `${run.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(run.status)}
                          <div className="flex space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedRun(run)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Execution Details</DialogTitle>
                                  <DialogDescription>Run ID: {run.id}</DialogDescription>
                                </DialogHeader>
                                {selectedRun && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Task Details</h4>
                                        <div className="space-y-2 text-sm">
                                          <div><span className="font-medium">Task:</span> {getTaskDescription(selectedRun)}</div>
                                          <div><span className="font-medium">Status:</span> {getStatusBadge(selectedRun.status)}</div>
                                          <div><span className="font-medium">Current Step:</span> {selectedRun.currentStep}</div>
                                          <div><span className="font-medium">Progress:</span> {selectedRun.progress}%</div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">Timing</h4>
                                        <div className="space-y-2 text-sm">
                                          <div><span className="font-medium">Start:</span> {new Date(selectedRun.startTime).toLocaleString()}</div>
                                          {selectedRun.endTime && <div><span className="font-medium">End:</span> {new Date(selectedRun.endTime).toLocaleString()}</div>}
                                          <div><span className="font-medium">Duration:</span> {formatDuration(selectedRun.startTime, selectedRun.endTime)}</div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {selectedRun.error && (
                                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <h4 className="font-medium text-red-900 mb-2">Error</h4>
                                        <p className="text-red-700 text-sm">{selectedRun.error}</p>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <h4 className="font-medium mb-3">Execution Log</h4>
                                      <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                                        {selectedRun.logs.map((log, index) => (
                                          <div key={index} className="text-sm text-gray-700 mb-1">
                                            <span className="text-gray-500">{index + 1}.</span> {log}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-3">Screenshots ({selectedRun.screenshots.length})</h4>
                                      <div className="grid grid-cols-3 gap-4">
                                        {selectedRun.screenshots.map((screenshot, index) => (
                                          <div key={index} className="bg-gray-200 h-24 rounded border flex items-center justify-center text-sm text-gray-500">
                                            Step {index + 1}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
