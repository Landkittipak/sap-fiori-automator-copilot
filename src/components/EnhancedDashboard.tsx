
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Store, 
  Layers,
  Download,
  User
} from 'lucide-react';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';
import { TemplateMarketplace } from './marketplace/TemplateMarketplace';
import { BulkOperations } from './bulk/BulkOperations';
import { ExportFunctionality } from './export/ExportFunctionality';

export const EnhancedDashboard = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SAP Copilot Dashboard</h1>
        <p className="text-gray-600">Advanced automation platform with comprehensive features</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Bulk Operations
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
        </TabsList>

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
