
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Play,
  Copy
} from 'lucide-react';

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
}

export const TemplateManager = () => {
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
      createdAt: '2024-01-15'
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
      createdAt: '2024-01-20'
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    prompt: '',
    inputs: [] as TemplateInput[]
  });

  const resetNewTemplate = () => {
    setNewTemplate({
      name: '',
      description: '',
      prompt: '',
      inputs: []
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
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTemplates(prev => [...prev, template]);
    resetNewTemplate();
    setIsCreateDialogOpen(false);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const extractPlaceholders = (prompt: string) => {
    const matches = prompt.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600">Create and manage reusable SAP automation templates</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetNewTemplate}>
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
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteTemplate(template.id)}
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
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Use
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
