
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Save, 
  Play, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Calendar,
  Filter,
  Download,
  Share,
  Clock
} from 'lucide-react';
import { useDatabaseRunHistory } from '@/hooks/useDatabaseTaskExecution';
import { useToast } from '@/hooks/use-toast';

interface Widget {
  id: string;
  type: 'chart' | 'metric' | 'table';
  title: string;
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  dataSource: string;
  filters: any[];
  position: { x: number; y: number; w: number; h: number };
}

interface Report {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  created: string;
}

export const CustomReportBuilder = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newWidget, setNewWidget] = useState<Partial<Widget>>({});
  const { runs } = useDatabaseRunHistory();
  const { toast } = useToast();

  const widgetTypes = [
    { value: 'chart', label: 'Chart', icon: BarChart3 },
    { value: 'metric', label: 'Metric Card', icon: Calendar },
    { value: 'table', label: 'Data Table', icon: Filter },
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'area', label: 'Area Chart', icon: BarChart3 },
  ];

  const dataSources = [
    { value: 'executions', label: 'Task Executions' },
    { value: 'templates', label: 'Template Usage' },
    { value: 'performance', label: 'Performance Metrics' },
    { value: 'errors', label: 'Error Analysis' },
  ];

  const createNewReport = () => {
    const newReport: Report = {
      id: `report_${Date.now()}`,
      name: 'New Report',
      description: '',
      widgets: [],
      created: new Date().toISOString(),
    };
    setCurrentReport(newReport);
    setIsEditing(true);
  };

  const saveReport = () => {
    if (!currentReport) return;
    
    const updatedReports = reports.filter(r => r.id !== currentReport.id);
    setReports([...updatedReports, currentReport]);
    setIsEditing(false);
    
    toast({
      title: "Report Saved",
      description: `"${currentReport.name}" has been saved successfully.`,
    });
  };

  const addWidget = () => {
    if (!currentReport || !newWidget.type || !newWidget.title) return;

    const widget: Widget = {
      id: `widget_${Date.now()}`,
      type: newWidget.type as 'chart' | 'metric' | 'table',
      title: newWidget.title,
      chartType: newWidget.chartType as 'bar' | 'line' | 'pie' | 'area',
      dataSource: newWidget.dataSource || 'executions',
      filters: [],
      position: { x: 0, y: 0, w: 6, h: 4 },
    };

    setCurrentReport({
      ...currentReport,
      widgets: [...currentReport.widgets, widget],
    });

    setNewWidget({});
  };

  const removeWidget = (widgetId: string) => {
    if (!currentReport) return;
    
    setCurrentReport({
      ...currentReport,
      widgets: currentReport.widgets.filter(w => w.id !== widgetId),
    });
  };

  const generateReport = () => {
    if (!currentReport) return;

    // Simulate report generation
    const reportData = {
      name: currentReport.name,
      generated: new Date().toISOString(),
      widgets: currentReport.widgets.map(widget => ({
        title: widget.title,
        type: widget.type,
        data: generateWidgetData(widget),
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: "Your custom report has been exported successfully.",
    });
  };

  const generateWidgetData = (widget: Widget) => {
    // Generate sample data based on widget configuration
    switch (widget.dataSource) {
      case 'executions':
        return {
          total: runs.length,
          completed: runs.filter(r => r.status === 'completed').length,
          failed: runs.filter(r => r.status === 'failed').length,
        };
      case 'templates':
        const templateUsage = runs.reduce((acc, run) => {
          const template = run.logs[0] || 'Unknown';
          acc[template] = (acc[template] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        return templateUsage;
      case 'performance':
        const completedRuns = runs.filter(r => r.status === 'completed' && r.endTime);
        const avgDuration = completedRuns.length > 0
          ? completedRuns.reduce((acc, run) => {
              const duration = (new Date(run.endTime!).getTime() - new Date(run.startTime).getTime()) / 1000 / 60;
              return acc + duration;
            }, 0) / completedRuns.length
          : 0;
        return { avgDuration: Math.round(avgDuration * 100) / 100 };
      default:
        return {};
    }
  };

  const scheduleReport = () => {
    if (!currentReport) return;
    
    // In a real app, this would set up actual scheduling
    toast({
      title: "Report Scheduled",
      description: "Your report has been scheduled for automatic generation.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Report Builder</h2>
          <p className="text-gray-600">Create and manage custom analytics reports</p>
        </div>
        <Button onClick={createNewReport}>
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </Button>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {currentReport ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input
                      id="report-name"
                      value={currentReport.name}
                      onChange={(e) => setCurrentReport({
                        ...currentReport,
                        name: e.target.value,
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="report-description">Description</Label>
                    <Textarea
                      id="report-description"
                      value={currentReport.description}
                      onChange={(e) => setCurrentReport({
                        ...currentReport,
                        description: e.target.value,
                      })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={saveReport} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit
                        </Button>
                        <Button size="sm" onClick={generateReport}>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Widget Builder */}
              {isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Widget</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Widget Type</Label>
                      <Select
                        value={newWidget.type}
                        onValueChange={(value) => setNewWidget({ ...newWidget, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select widget type" />
                        </SelectTrigger>
                        <SelectContent>
                          {widgetTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="w-4 h-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {newWidget.type === 'chart' && (
                      <div>
                        <Label>Chart Type</Label>
                        <Select
                          value={newWidget.chartType}
                          onValueChange={(value) => setNewWidget({ ...newWidget, chartType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select chart type" />
                          </SelectTrigger>
                          <SelectContent>
                            {chartTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="w-4 h-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label>Data Source</Label>
                      <Select
                        value={newWidget.dataSource}
                        onValueChange={(value) => setNewWidget({ ...newWidget, dataSource: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select data source" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataSources.map((source) => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Widget Title</Label>
                      <Input
                        value={newWidget.title || ''}
                        onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                        placeholder="Enter widget title"
                      />
                    </div>

                    <Button onClick={addWidget} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Widget
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Widget List */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Widgets ({currentReport.widgets.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentReport.widgets.map((widget) => (
                      <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{widget.title}</div>
                          <div className="text-sm text-gray-500">
                            {widget.type} • {widget.dataSource}
                          </div>
                        </div>
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeWidget(widget.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {currentReport.widgets.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No widgets added yet. Create your first widget to get started.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Selected</h3>
                <p className="text-gray-500 mb-4">Create a new report or select an existing one to get started.</p>
                <Button onClick={createNewReport}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Report
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Executive Summary',
                description: 'High-level metrics and KPIs for leadership',
                widgets: ['Success Rate', 'Total Executions', 'Performance Trend'],
              },
              {
                name: 'Operational Dashboard',
                description: 'Detailed operational metrics and analysis',
                widgets: ['Hourly Activity', 'Template Performance', 'Error Analysis'],
              },
              {
                name: 'Performance Report',
                description: 'Deep dive into execution performance',
                widgets: ['Response Time', 'SLA Compliance', 'Resource Usage'],
              },
            ].map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Includes:</div>
                    {template.widgets.map((widget, idx) => (
                      <Badge key={idx} variant="secondary" className="mr-1">
                        {widget}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full mt-4" onClick={createNewReport}>
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Manage automated report generation and delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.filter(r => r.schedule?.enabled).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-gray-500">
                        {report.schedule?.frequency} at {report.schedule?.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                      <Button variant="outline" size="sm">
                        Edit Schedule
                      </Button>
                    </div>
                  </div>
                ))}
                
                {reports.filter(r => r.schedule?.enabled).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No scheduled reports. Set up automatic report generation to save time.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
