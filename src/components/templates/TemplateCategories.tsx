
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', color: 'bg-gray-100 text-gray-800' },
  { id: 'stock', name: 'Stock Management', color: 'bg-blue-100 text-blue-800' },
  { id: 'master-data', name: 'Master Data', color: 'bg-green-100 text-green-800' },
  { id: 'procurement', name: 'Procurement', color: 'bg-purple-100 text-purple-800' },
  { id: 'finance', name: 'Finance', color: 'bg-orange-100 text-orange-800' },
  { id: 'reporting', name: 'Reporting', color: 'bg-red-100 text-red-800' },
] as const;

interface TemplateCategoriesProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  counts?: Record<string, number>;
}

export const TemplateCategories = ({ 
  selectedCategory, 
  onCategoryChange, 
  counts = {} 
}: TemplateCategoriesProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {TEMPLATE_CATEGORIES.map((category) => {
        const count = counts[category.id] || 0;
        const isSelected = selectedCategory === category.id;
        
        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "transition-all duration-200",
              !isSelected && "hover:scale-105"
            )}
          >
            {category.name}
            {count > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 text-xs"
              >
                {count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};
