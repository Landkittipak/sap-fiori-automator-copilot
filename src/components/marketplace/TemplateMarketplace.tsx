
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Download, 
  Star,
  Eye,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  downloads: number;
  rating: number;
  lastUpdated: string;
  inputs: { name: string; type: string; required: boolean }[];
  prompt: string;
  tags: string[];
}

// Mock marketplace templates
const marketplaceTemplates: MarketplaceTemplate[] = [
  {
    id: '1',
    name: 'Advanced Stock Transfer',
    description: 'Enhanced stock transfer with validation and approval workflow',
    category: 'Inventory',
    author: 'SAP Expert',
    downloads: 245,
    rating: 4.8,
    lastUpdated: '2024-01-15',
    inputs: [
      { name: 'material', type: 'text', required: true },
      { name: 'quantity', type: 'number', required: true },
      { name: 'from_plant', type: 'text', required: true },
      { name: 'to_plant', type: 'text', required: true },
      { name: 'approval_required', type: 'boolean', required: false }
    ],
    prompt: 'Execute stock transfer with enhanced validation and approval workflow',
    tags: ['inventory', 'transfer', 'approval']
  },
  {
    id: '2',
    name: 'Bulk Material Update',
    description: 'Update multiple materials at once with batch processing',
    category: 'Master Data',
    author: 'Automation Pro',
    downloads: 189,
    rating: 4.6,
    lastUpdated: '2024-01-10',
    inputs: [
      { name: 'material_list', type: 'text', required: true },
      { name: 'field_to_update', type: 'text', required: true },
      { name: 'new_value', type: 'text', required: true }
    ],
    prompt: 'Perform bulk updates on material master data',
    tags: ['bulk', 'materials', 'update']
  },
  {
    id: '3',
    name: 'Purchase Order Analytics',
    description: 'Generate comprehensive PO reports with analytics',
    category: 'Procurement',
    author: 'Data Analyst',
    downloads: 156,
    rating: 4.7,
    lastUpdated: '2024-01-08',
    inputs: [
      { name: 'date_from', type: 'date', required: true },
      { name: 'date_to', type: 'date', required: true },
      { name: 'vendor_filter', type: 'text', required: false },
      { name: 'include_charts', type: 'boolean', required: false }
    ],
    prompt: 'Generate detailed purchase order analytics and reports',
    tags: ['analytics', 'procurement', 'reports']
  }
];

export const TemplateMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);
  const { toast } = useToast();

  const categories = ['all', ...Array.from(new Set(marketplaceTemplates.map(t => t.category)))];

  const filteredTemplates = marketplaceTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleInstallTemplate = (template: MarketplaceTemplate) => {
    // In a real implementation, this would save the template to the user's collection
    toast({
      title: "Template Installed",
      description: `"${template.name}" has been added to your templates.`,
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Template Marketplace</h2>
        <p className="text-gray-600">Discover and install community-created automation templates</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates, tags, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </div>
                <Badge variant="outline">{template.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  {renderStars(template.rating)}
                  <span>{template.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="w-3 h-3" />
                  <span>{template.downloads}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(template.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="text-sm text-gray-600">
                <span className="font-medium">By:</span> {template.author}
              </div>

              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(template)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{template.name}</DialogTitle>
                      <DialogDescription>Template Details</DialogDescription>
                    </DialogHeader>
                    {selectedTemplate && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-gray-600">{selectedTemplate.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Required Inputs</h4>
                          <div className="space-y-2">
                            {selectedTemplate.inputs.map((input, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="font-medium">{input.name}</span>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">{input.type}</Badge>
                                  {input.required && <Badge variant="destructive">Required</Badge>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedTemplate.tags.map(tag => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button size="sm" onClick={() => handleInstallTemplate(template)}>
                  <Download className="w-4 h-4 mr-1" />
                  Install
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found matching your criteria.</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};
