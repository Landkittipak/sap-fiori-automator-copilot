
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, FileText, Bot } from 'lucide-react';

export const TaskSubmission = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [taskInput, setTaskInput] = useState('');
  const [templateInputs, setTemplateInputs] = useState<Record<string, string>>({});
  
  const templates = [
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
      ]
    },
    {
      id: 'lead-time',
      name: 'Lead Time Update',
      description: 'Update material lead times in Material Master',
      prompt: 'Open Material Master for {material}, go to MRP2 tab, and set lead time to {new_days} days.',
      inputs: [
        { id: 'material', label: 'Material Code', type: 'text', placeholder: 'FG200' },
        { id: 'new_days', label: 'Lead Time (Days)', type: 'number', placeholder: '14' },
      ]
    },
    {
      id: 'stock-check',
      name: 'Stock Check',
      description: 'Check material stock levels',
      prompt: 'Open "Stock – Single Material" app and look up material {material}. Take a screenshot of stock levels.',
      inputs: [
        { id: 'material', label: 'Material Code', type: 'text', placeholder: 'FG150' },
      ]
    }
  ];

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const handleTemplateInputChange = (inputId: string, value: string) => {
    setTemplateInputs(prev => ({
      ...prev,
      [inputId]: value
    }));
  };

  const generatePrompt = () => {
    if (!selectedTemplateData) return taskInput;
    
    let prompt = selectedTemplateData.prompt;
    selectedTemplateData.inputs.forEach(input => {
      prompt = prompt.replace(`{${input.id}}`, templateInputs[input.id] || `{${input.id}}`);
    });
    return prompt;
  };

  const handleSubmit = () => {
    const finalPrompt = selectedTemplate ? generatePrompt() : taskInput;
    console.log('Submitting task:', finalPrompt);
    // Here you would trigger the c/ua agent
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submit Task</h1>
        <p className="text-gray-600">Execute SAP automation tasks using templates or custom prompts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Input */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>Task Configuration</span>
              </CardTitle>
              <CardDescription>
                Choose a template or write a custom task description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Template (Optional)</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template or leave blank for custom task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Template (Custom Task)</SelectItem>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Inputs */}
              {selectedTemplateData && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">{selectedTemplateData.name}</span>
                  </div>
                  <p className="text-sm text-blue-700">{selectedTemplateData.description}</p>
                  
                  {selectedTemplateData.inputs.map(input => (
                    <div key={input.id} className="space-y-2">
                      <Label>{input.label}</Label>
                      {input.type === 'select' ? (
                        <Select 
                          value={templateInputs[input.id] || ''} 
                          onValueChange={(value) => handleTemplateInputChange(input.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${input.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {input.options?.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={input.type}
                          placeholder={input.placeholder}
                          value={templateInputs[input.id] || ''}
                          onChange={(e) => handleTemplateInputChange(input.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Task Input */}
              {(selectedTemplate === '' || selectedTemplate === 'none') && (
                <div className="space-y-2">
                  <Label>Task Description</Label>
                  <Textarea
                    placeholder="Describe what you want to do in SAP (e.g., 'Transfer 100 units of FG100 from Plant 1710 to 1010')"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview & Submit */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Preview</CardTitle>
              <CardDescription>Review the generated prompt before execution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Generated Prompt:</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {generatePrompt() || 'Enter a task description or select a template...'}
                </p>
              </div>

              {selectedTemplateData && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Template Variables:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplateData.inputs.map(input => (
                      <Badge 
                        key={input.id} 
                        variant={templateInputs[input.id] ? "default" : "outline"}
                      >
                        {input.id}: {templateInputs[input.id] || 'not set'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                size="lg"
                disabled={!generatePrompt().trim()}
              >
                <Play className="w-4 h-4 mr-2" />
                Execute Task
              </Button>
            </CardContent>
          </Card>

          {/* Execution Info */}
          <Card>
            <CardHeader>
              <CardTitle>Execution Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Agent:</span>
                <span>OpenAI Operator</span>
              </div>
              <div className="flex justify-between">
                <span>Browser:</span>
                <span>Chrome (c/ua)</span>
              </div>
              <div className="flex justify-between">
                <span>Target:</span>
                <span>SAP Fiori</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Duration:</span>
                <span>2-5 minutes</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
