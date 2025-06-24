
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  RotateCcw,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Play
} from 'lucide-react';

interface RunRecord {
  id: string;
  task: string;
  template?: string;
  status: 'completed' | 'running' | 'failed' | 'queued';
  startTime: string;
  endTime?: string;
  duration?: string;
  agent: string;
  screenshots: string[];
  logs: string[];
  error?: string;
}

export const RunHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(null);

  const runs: RunRecord[] = [
    {
      id: 'run_001',
      task: 'Transfer 100 units of material FG100 from Plant 1710 to 1010',
      template: 'Stock Transfer',
      status: 'completed',
      startTime: '2024-01-24 14:30:00',
      endTime: '2024-01-24 14:32:15',
      duration: '2m 15s',
      agent: 'OpenAI Operator',
      screenshots: ['step1.png', 'step2.png', 'step3.png'],
      logs: [
        'Opening SAP Fiori launchpad',
        'Navigating to Stock Transfer app',
        'Entering material code FG100',
        'Setting quantity to 100',
        'Selecting source plant 1710',
        'Selecting destination plant 1010',
        'Clicking Execute button',
        'Transfer completed successfully'
      ]
    },
    {
      id: 'run_002',
      task: 'Update lead time for material FG200 to 14 days',
      template: 'Lead Time Update',
      status: 'running',
      startTime: '2024-01-24 14:35:00',
      agent: 'OpenAI Operator',
      screenshots: ['step1.png', 'step2.png'],
      logs: [
        'Opening SAP Fiori launchpad',
        'Navigating to Material Master app',
        'Searching for material FG200',
        'Opening Material Master details...'
      ]
    },
    {
      id: 'run_003',
      task: 'Check stock levels for material FG150',
      template: 'Stock Check',
      status: 'failed',
      startTime: '2024-01-24 14:20:00',
      endTime: '2024-01-24 14:23:45',
      duration: '3m 45s',
      agent: 'OpenAI Operator',
      screenshots: ['step1.png', 'error.png'],
      logs: [
        'Opening SAP Fiori launchpad',
        'Navigating to Stock Overview app',
        'Entering material code FG150',
        'Error: Material not found in system'
      ],
      error: 'Material FG150 does not exist in the system'
    },
    {
      id: 'run_004',
      task: 'Create purchase order for vendor 1000 with material FG300',
      status: 'completed',
      startTime: '2024-01-24 13:45:00',
      endTime: '2024-01-24 13:48:30',
      duration: '3m 30s',
      agent: 'OpenAI Operator',
      screenshots: ['step1.png', 'step2.png', 'step3.png', 'final.png'],
      logs: [
        'Opening SAP Fiori launchpad',
        'Navigating to Purchase Order app',
        'Creating new purchase order',
        'Setting vendor to 1000',
        'Adding material FG300',
        'Setting quantity and delivery date',
        'Saving purchase order',
        'PO created with number 4500123456'
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running':
        return <Loader className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'queued':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running':
        return <Badge className="bg-yellow-100 text-yellow-800">Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'queued':
        return <Badge className="bg-gray-100 text-gray-800">Queued</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredRuns = runs.filter(run => {
    const matchesSearch = run.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         run.template?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Run History</h1>
          <p className="text-gray-600">Track and monitor your SAP automation task executions</p>
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
                placeholder="Search tasks, templates..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Run History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>{filteredRuns.length} tasks found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRuns.map((run) => (
              <div key={run.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(run.status)}
                      <h3 className="font-medium text-gray-900 truncate">{run.task}</h3>
                      {run.template && (
                        <Badge variant="outline" className="text-xs">
                          {run.template}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{run.startTime}</span>
                      </div>
                      {run.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{run.duration}</span>
                        </div>
                      )}
                      <span>Agent: {run.agent}</span>
                    </div>
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
                                    <div><span className="font-medium">Task:</span> {selectedRun.task}</div>
                                    <div><span className="font-medium">Template:</span> {selectedRun.template || 'Custom'}</div>
                                    <div><span className="font-medium">Status:</span> {getStatusBadge(selectedRun.status)}</div>
                                    <div><span className="font-medium">Agent:</span> {selectedRun.agent}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Timing</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><span className="font-medium">Start:</span> {selectedRun.startTime}</div>
                                    {selectedRun.endTime && <div><span className="font-medium">End:</span> {selectedRun.endTime}</div>}
                                    {selectedRun.duration && <div><span className="font-medium">Duration:</span> {selectedRun.duration}</div>}
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
                      
                      {run.status === 'failed' && (
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
