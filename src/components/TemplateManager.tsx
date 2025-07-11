import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Play,
  Copy,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { TemplateEditor } from './templates/TemplateEditor';
import { TemplateCategories, TEMPLATE_CATEGORIES } from './templates/TemplateCategories';
import { EnhancedCard } from './ui/enhanced-card';
import { useLocalStorage } from '@/lib/localStorage';

interface TemplateInput {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  options?: string[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  inputs: TemplateInput[];
  usageCount: number;
  createdAt: string;
  category: string;
}

export const TemplateManager = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useLocalStorage('template_category', 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useLocalStorage('template_view_mode', 'grid');
  
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 'stock-transfer',
      name: 'Stock Transfer',
      description: 'Transfer materials between plants',
      prompt: 'Transfer {qty} units of material {material} from Plant {from_plant} to {to_plant} using SAP Stock Transfer app.',
      inputs: [
        { id: 'qty', label: 'Quantity', type: 'number', placeholder: '100' },
        { id: 'material', label: 'Material Code', type: 'text', placeholder: 'FG100' },
        { id: 'from_plant', label: 'From Plant', type: 'select', options: ['1710', '1020', '1030'] },
        { id: 'to_plant', label: 'To Plant', type: 'select', options: ['1010', '1020', '1030'] },
      ],
      usageCount: 24,
      createdAt: '2024-01-15',
      category: 'stock'
    },
    {
      id: 'lead-time',
      name: 'Lead Time Update',
      description: 'Update material lead times in Material Master',
      prompt: 'Open Material Master for {material}, go to MRP2 tab, and set lead time to {new_days} days.',
      inputs: [
        { id: 'material', label: 'Material Code', type: 'text', placeholder: 'FG200' },
        { id: 'new_days', label: 'Lead Time (Days)', type: 'number', placeholder: '14' },
      ],
      usageCount: 12,
      createdAt: '2024-01-20',
      category: 'master-data'
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    prompt: '',
    category: 'master-data',
    inputs: [] as TemplateInput[]
  });

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryCounts = () => {
    const counts: Record<string, number> = { all: templates.length };
    templates.forEach(template => {
      counts[template.category] = (counts[template.category] || 0) + 1;
    });
    return counts;
  };

  const handleRunTemplate = (template: Template, inputs: Record<string, any>) => {
    // Increment usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));
    
    toast({
      title: "Template Executed",
      description: `"${template.name}" is now running with your configuration.`,
    });

    // Clear selection after running
    setSelectedTemplate(null);
  };

  const resetNewTemplate = () => {
    setNewTemplate({
      name: '',
      description: '',
      prompt: '',
      category: 'master-data',
      inputs: []
    });
  };

  const startEdit = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      description: template.description,
      prompt: template.prompt,
      category: template.category,
      inputs: [...template.inputs]
    });
    setIsEditDialogOpen(true);
  };

  const startPreview = (template: Template) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const saveEdit = () => {
    if (!editingTemplate) return;
    
    setTemplates(prev => prev.map(t => 
      t.id === editingTemplate.id 
        ? { ...t, ...newTemplate }
        : t
    ));
    
    setIsEditDialogOpen(false);
    setEditingTemplate(null);
    resetNewTemplate();
    
    toast({
      title: "Template updated",
      description: "Template has been successfully updated.",
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Template deleted",
      description: "Template has been removed from your library.",
    });
  };

  const copyTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    toast({
      title: "Template copied",
      description: "A copy of the template has been created.",
    });
  };

  const addInput = () => {
    setNewTemplate(prev => ({
      ...prev,
      inputs: [...prev.inputs, {
        id: `input_${Date.now()}`,
        label: '',
        type: 'text',
        placeholder: ''
      }]
    }));
  };

  const updateInput = (index: number, field: keyof TemplateInput, value: string | string[]) => {
    setNewTemplate(prev => ({
      ...prev,
      inputs: prev.inputs.map((input, i) => 
        i === index ? { ...input, [field]: value } : input
      )
    }));
  };

  const removeInput = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      inputs: prev.inputs.filter((_, i) => i !== index)
    }));
  };

  const saveTemplate = () => {
    const template: Template = {
      id: `template_${Date.now()}`,
      ...newTemplate,
      category: 'master-data', // Add default category
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTemplates(prev => [...prev, template]);
    resetNewTemplate();
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Template created",
      description: "New template has been added to your library.",
    });
  };

  const extractPlaceholders = (prompt: string) => {
    const matches = prompt.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  if (selectedTemplate) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTemplate(null)}
            className="hover:scale-105 transition-transform"
          >
            ← Back to Templates
          </Button>
        </div>
        <TemplateEditor 
          template={selectedTemplate} 
          onRun={handleRunTemplate}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600">Create and manage reusable SAP automation templates</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetNewTemplate} className="hover:scale-105 transition-transform">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Build a reusable template with dynamic inputs for SAP automation tasks
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      placeholder="e.g., Stock Transfer"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Brief description of what this template does"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={newTemplate.category} 
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.filter(cat => cat.id !== 'all').map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Prompt Template</Label>
                    <Textarea
                      placeholder="Write your automation prompt with placeholders like {material}, {quantity}, etc."
                      value={newTemplate.prompt}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, prompt: e.target.value }))}
                      rows={3}
                    />
                    {newTemplate.prompt && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Detected placeholders:</span>{' '}
                        {extractPlaceholders(newTemplate.prompt).join(', ') || 'None'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Configuration */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Input Fields</Label>
                    <Button variant="outline" size="sm" onClick={addInput}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Input
                    </Button>
                  </div>
                  
                  {newTemplate.inputs.map((input, index) => (
                    <div key={input.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Input {index + 1}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeInput(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>ID</Label>
                          <Input
                            placeholder="field_name"
                            value={input.id}
                            onChange={(e) => updateInput(index, 'id', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Label</Label>
                          <Input
                            placeholder="Field Label"
                            value={input.label}
                            onChange={(e) => updateInput(index, 'label', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Type</Label>
                          <Select 
                            value={input.type} 
                            onValueChange={(value) => updateInput(index, 'type', value as 'text' | 'number' | 'select')}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Placeholder</Label>
                          <Input
                            placeholder="Placeholder text"
                            value={input.placeholder || ''}
                            onChange={(e) => updateInput(index, 'placeholder', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {input.type === 'select' && (
                        <div className="space-y-1">
                          <Label>Options (comma-separated)</Label>
                          <Input
                            placeholder="Option1, Option2, Option3"
                            value={input.options?.join(', ') || ''}
                            onChange={(e) => updateInput(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveTemplate} disabled={!newTemplate.name || !newTemplate.prompt}>
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog - Enhanced with input field configuration */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Template</DialogTitle>
                <DialogDescription>
                  Modify your existing template configuration
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      placeholder="e.g., Stock Transfer"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Brief description of what this template does"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={newTemplate.category} 
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.filter(cat => cat.id !== 'all').map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Prompt Template</Label>
                    <Textarea
                      placeholder="Write your automation prompt with placeholders like {material}, {quantity}, etc."
                      value={newTemplate.prompt}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, prompt: e.target.value }))}
                      rows={3}
                    />
                    {newTemplate.prompt && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Detected placeholders:</span>{' '}
                        {extractPlaceholders(newTemplate.prompt).join(', ') || 'None'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Configuration for Edit Dialog */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Input Fields</Label>
                    <Button variant="outline" size="sm" onClick={addInput}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Input
                    </Button>
                  </div>
                  
                  {newTemplate.inputs.map((input, index) => (
                    <div key={input.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Input {index + 1}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeInput(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>ID</Label>
                          <Input
                            placeholder="field_name"
                            value={input.id}
                            onChange={(e) => updateInput(index, 'id', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Label</Label>
                          <Input
                            placeholder="Field Label"
                            value={input.label}
                            onChange={(e) => updateInput(index, 'label', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Type</Label>
                          <Select 
                            value={input.type} 
                            onValueChange={(value) => updateInput(index, 'type', value as 'text' | 'number' | 'select')}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Placeholder</Label>
                          <Input
                            placeholder="Placeholder text"
                            value={input.placeholder || ''}
                            onChange={(e) => updateInput(index, 'placeholder', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {input.type === 'select' && (
                        <div className="space-y-1">
                          <Label>Options (comma-separated)</Label>
                          <Input
                            placeholder="Option1, Option2, Option3"
                            value={input.options?.join(', ') || ''}
                            onChange={(e) => updateInput(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveEdit} disabled={!newTemplate.name || !newTemplate.prompt}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Preview Dialog */}
          <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Template Preview</DialogTitle>
                <DialogDescription>
                  See how this template will look when users fill it out
                </DialogDescription>
              </DialogHeader>
              
              {previewTemplate && (
                <TemplateEditor 
                  template={previewTemplate} 
                  onRun={() => {
                    setIsPreviewDialogOpen(false);
                    toast({
                      title: "Preview Mode",
                      description: "This was just a preview. Click 'Use' on the template card to actually run it.",
                    });
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>

        <TemplateCategories
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          counts={getCategoryCounts()}
        />
      </div>

      {/* Enhanced Templates Grid */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {filteredTemplates.map((template, index) => (
          <EnhancedCard 
            key={template.id} 
            interactive
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => startPreview(template)}
                    title="Preview"
                    className="hover:scale-110 transition-transform"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => startEdit(template)}
                    title="Edit"
                    className="hover:scale-110 transition-transform"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteTemplate(template.id)}
                    title="Delete"
                    className="hover:scale-110 transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {template.prompt}
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Input Fields:</span>
                <div className="flex flex-wrap gap-1">
                  {template.inputs.map((input) => (
                    <Badge key={input.id} variant="outline" className="text-xs">
                      {input.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm text-gray-500">
                  Used {template.usageCount} times
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyTemplate(template)}
                    className="hover:scale-105 transition-transform"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                    className="hover:scale-105 transition-transform"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Use
                  </Button>
                </div>
              </div>
            </CardContent>
          </EnhancedCard>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Try adjusting your search terms.' : 'Create your first template to get started.'}
          </p>
          {!searchQuery && (
            <Button onClick={() => {resetNewTemplate(); setIsCreateDialogOpen(true);}}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
