
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, FileText, Package, Clock, Star } from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { cn } from '@/lib/utils';

interface QuickTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  estimatedTime: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  popular?: boolean;
}

interface QuickTemplatesProps {
  onSelectTemplate: (templateId: string) => void;
  selectedCategory?: string;
}

export const QuickTemplates = ({ onSelectTemplate, selectedCategory = 'all' }: QuickTemplatesProps) => {
  const templates: QuickTemplate[] = [
    {
      id: 'stock-transfer',
      name: 'Stock Transfer',
      description: 'Transfer materials between plants',
      icon: Package,
      estimatedTime: '2-3 min',
      category: 'stock',
      difficulty: 'Easy',
      popular: true,
    },
    {
      id: 'stock-check',
      name: 'Stock Check',
      description: 'Check current stock levels for materials',
      icon: FileText,
      estimatedTime: '1-2 min',
      category: 'stock',
      difficulty: 'Easy',
    },
    {
      id: 'lead-time',
      name: 'Lead Time Update',
      description: 'Update material lead times in Material Master',
      icon: Clock,
      estimatedTime: '2-4 min',
      category: 'master-data',
      difficulty: 'Medium',
      popular: true,
    },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template, index) => {
          const Icon = template.icon;
          return (
            <EnhancedCard 
              key={template.id} 
              interactive
              className={cn(
                'transform transition-all duration-300',
                'hover:shadow-lg hover:-translate-y-1',
                'animate-fade-in',
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  {template.popular && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Est. {template.estimatedTime}</span>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => onSelectTemplate(template.id)}
                    className="w-full flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105"
                  >
                    <Play className="w-3 h-3" />
                    <span>Use Template</span>
                  </Button>
                </div>
              </CardContent>
            </EnhancedCard>
          );
        })}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
          <p className="text-gray-500">Try selecting a different category or check back later.</p>
        </div>
      )}
    </div>
  );
};
