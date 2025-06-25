
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, FileText, Package, Clock } from 'lucide-react';

interface QuickTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  estimatedTime: string;
}

interface QuickTemplatesProps {
  onSelectTemplate: (templateId: string) => void;
}

export const QuickTemplates = ({ onSelectTemplate }: QuickTemplatesProps) => {
  const templates: QuickTemplate[] = [
    {
      id: 'stock-transfer',
      name: 'Stock Transfer',
      description: 'Transfer materials between plants',
      icon: Package,
      estimatedTime: '2-3 min',
    },
    {
      id: 'stock-check',
      name: 'Stock Check',
      description: 'Check current stock levels for materials',
      icon: FileText,
      estimatedTime: '1-2 min',
    },
    {
      id: 'lead-time',
      name: 'Lead Time Update',
      description: 'Update material lead times in Material Master',
      icon: Clock,
      estimatedTime: '2-4 min',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map((template) => {
        const Icon = template.icon;
        return (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Est. {template.estimatedTime}</span>
                <Button
                  size="sm"
                  onClick={() => onSelectTemplate(template.id)}
                  className="flex items-center space-x-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Use</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
