
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  FileImage,
  Calendar,
  Filter,
  BarChart3
} from 'lucide-react';
import { useDatabaseRunHistory } from '@/hooks/useDatabaseTaskExecution';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

export const ExportFunctionality = () => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState('all');
  const [includeScreenshots, setIncludeScreenshots] = useState(false);
  const [includeLogs, setIncludeLogs] = useState(true);
  const [includeAnalytics, setIncludeAnalytics] = useState(false);
  const { runs } = useDatabaseRunHistory();
  const { toast } = useToast();

  const filterRuns = () => {
    let filteredRuns = [...runs];

    // Filter by status
    if (statusFilter !== 'all') {
      filteredRuns = filteredRuns.filter(run => run.status === statusFilter);
    }

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      filteredRuns = filteredRuns.filter(run => {
        const runDate = new Date(run.startTime);
        return runDate >= dateRange.from! && runDate <= dateRange.to!;
      });
    }

    return filteredRuns;
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available for export with current filters.",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No data available for export with current filters.",
        variant: "destructive",
      });
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportExecutionReport = () => {
    const filteredRuns = filterRuns();
    
    const reportData = filteredRuns.map(run => ({
      id: run.id,
      status: run.status,
      currentStep: run.currentStep,
      progress: run.progress,
      startTime: new Date(run.startTime).toLocaleString(),
      endTime: run.endTime ? new Date(run.endTime).toLocaleString() : 'N/A',
      duration: run.endTime 
        ? `${Math.round((new Date(run.endTime).getTime() - new Date(run.startTime).getTime()) / 1000 / 60)} minutes`
        : 'N/A',
      error: run.error || 'None',
      ...(includeLogs && { logs: run.logs.join(' | ') }),
      ...(includeScreenshots && { screenshots: run.screenshots.length })
    }));

    const filename = `execution_report_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    
    if (exportFormat === 'csv') {
      exportToCSV(reportData, filename);
    } else {
      exportToJSON(reportData, filename);
    }

    toast({
      title: "Export Complete",
      description: `Execution report exported as ${filename}`,
    });
  };

  const exportAnalyticsReport = () => {
    const filteredRuns = filterRuns();
    const totalRuns = filteredRuns.length;
    const completedRuns = filteredRuns.filter(run => run.status === 'completed').length;
    const failedRuns = filteredRuns.filter(run => run.status === 'failed').length;
    const successRate = totalRuns > 0 ? (completedRuns / totalRuns) * 100 : 0;

    // Calculate average duration
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

    // Template usage
    const templateUsage = filteredRuns.reduce((acc, run) => {
      const templateName = run.logs[0] || 'Unknown Task';
      acc[templateName] = (acc[templateName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const analyticsData = {
      summary: {
        totalExecutions: totalRuns,
        completedExecutions: completedRuns,
        failedExecutions: failedRuns,
        successRate: Math.round(successRate * 100) / 100,
        averageDuration: Math.round(avgDuration * 100) / 100
      },
      templateUsage,
      executionDetails: filteredRuns.map(run => ({
        id: run.id,
        status: run.status,
        startTime: run.startTime,
        endTime: run.endTime,
        duration: run.endTime 
          ? (new Date(run.endTime).getTime() - new Date(run.startTime).getTime()) / 1000 / 60
          : null
      }))
    };

    const filename = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    exportToJSON([analyticsData], filename);

    toast({
      title: "Analytics Export Complete",
      description: `Analytics report exported as ${filename}`,
    });
  };

  const exportTemplateUsage = () => {
    const filteredRuns = filterRuns();
    const templateUsage = filteredRuns.reduce((acc, run) => {
      const templateName = run.logs[0] || 'Unknown Task';
      if (!acc[templateName]) {
        acc[templateName] = {
          templateName,
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          averageDuration: 0
        };
      }
      
      acc[templateName].totalExecutions++;
      if (run.status === 'completed') {
        acc[templateName].successfulExecutions++;
      } else if (run.status === 'failed') {
        acc[templateName].failedExecutions++;
      }

      return acc;
    }, {} as Record<string, any>);

    const templateData = Object.values(templateUsage);
    const filename = `template_usage_${new Date().toISOString().split('T')[0]}.${exportFormat}`;

    if (exportFormat === 'csv') {
      exportToCSV(templateData, filename);
    } else {
      exportToJSON(templateData, filename);
    }

    toast({
      title: "Template Usage Export Complete",
      description: `Template usage report exported as ${filename}`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Export & Reports</h2>
        <p className="text-gray-600">Download execution data and analytics reports</p>
      </div>

      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
          <CardDescription>Customize your export settings and filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Export Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
                  <SelectItem value="json">JSON (Raw data)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status Filter</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed Only</SelectItem>
                  <SelectItem value="failed">Failed Only</SelectItem>
                  <SelectItem value="running">Running Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <DatePickerWithRange 
                value={dateRange} 
                onChange={setDateRange}
                placeholder="Select date range"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Include in Export</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-logs" 
                  checked={includeLogs}
                  onCheckedChange={setIncludeLogs}
                />
                <label htmlFor="include-logs" className="text-sm">
                  Execution logs and step details
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-screenshots" 
                  checked={includeScreenshots}
                  onCheckedChange={setIncludeScreenshots}
                />
                <label htmlFor="include-screenshots" className="text-sm">
                  Screenshot references and counts
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-analytics" 
                  checked={includeAnalytics}
                  onCheckedChange={setIncludeAnalytics}
                />
                <label htmlFor="include-analytics" className="text-sm">
                  Analytics and performance metrics
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Execution Report
            </CardTitle>
            <CardDescription>
              Detailed report of all task executions with logs and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportExecutionReport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Executions ({filterRuns().length} records)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics Report
            </CardTitle>
            <CardDescription>
              Performance metrics, success rates, and usage analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportAnalyticsReport} className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Template Usage
            </CardTitle>
            <CardDescription>
              Usage statistics and performance by template type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportTemplateUsage} className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Template Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Export Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{filterRuns().length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filterRuns().filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {filterRuns().filter(r => r.status === 'failed').length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {filterRuns().filter(r => r.status === 'running').length}
              </div>
              <div className="text-sm text-gray-600">Running</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
