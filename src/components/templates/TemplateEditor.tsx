
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Play, ArrowRight } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  inputs: TemplateInput[];
}

interface TemplateInput {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  options?: string[];
}

interface TemplateEditorProps {
  template: Template;
  onRun: (template: Template, inputs: Record<string, any>) => void;
}

export const TemplateEditor = ({ template, onRun }: TemplateEditorProps) => {
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [previewPrompt, setPreviewPrompt] = useState(template.prompt);
  const { toast } = useToast();

  // Plant options for autocomplete
  const plantOptions = ['1010', '1020', '1030', '1710', '2000', '2010'];
  
  // Material options for autocomplete
  const materialOptions = ['FG100', 'FG200', 'RM001', 'RM002', 'SF100'];

  const updateInputValue = (inputId: string, value: any) => {
    const newValues = { ...inputValues, [inputId]: value };
    setInputValues(newValues);
    
    // Update preview prompt with actual values
    let updatedPrompt = template.prompt;
    Object.entries(newValues).forEach(([key, val]) => {
      if (val) {
        updatedPrompt = updatedPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
      }
    });
    setPreviewPrompt(updatedPrompt);
  };

  const handleRun = () => {
    // Validate required inputs
    const missingInputs = template.inputs
      .filter(input => !inputValues[input.id] && input.id !== 'approval_required')
      .map(input => input.label);

    if (missingInputs.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingInputs.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    onRun(template, inputValues);
  };

  const renderInput = (input: TemplateInput) => {
    const value = inputValues[input.id] || '';

    switch (input.type) {
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => updateInputValue(input.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={input.placeholder || `Select ${input.label}`} />
            </SelectTrigger>
            <SelectContent>
              {input.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={input.placeholder}
            value={value}
            onChange={(e) => updateInputValue(input.id, e.target.value)}
          />
        );

      default:
        // For text inputs, provide smart autocomplete based on field name
        const getAutocompleteOptions = () => {
          if (input.id.includes('plant') || input.label.toLowerCase().includes('plant')) {
            return plantOptions;
          }
          if (input.id.includes('material') || input.label.toLowerCase().includes('material')) {
            return materialOptions;
          }
          return [];
        };

        const autocompleteOptions = getAutocompleteOptions();

        if (autocompleteOptions.length > 0) {
          return (
            <div className="relative">
              <Input
                placeholder={input.placeholder}
                value={value}
                onChange={(e) => updateInputValue(input.id, e.target.value)}
                list={`${input.id}-options`}
              />
              <datalist id={`${input.id}-options`}>
                {autocompleteOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              {autocompleteOptions.length > 0 && !value && (
                <div className="absolute top-full left-0 mt-1 text-xs text-gray-500">
                  Common values: {autocompleteOptions.slice(0, 3).join(', ')}
                  {autocompleteOptions.length > 3 && '...'}
                </div>
              )}
            </div>
          );
        }

        return (
          <Input
            placeholder={input.placeholder}
            value={value}
            onChange={(e) => updateInputValue(input.id, e.target.value)}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-blue-600" />
          {template.name}
        </CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Configuration</h4>
          {template.inputs.map((input) => (
            <div key={input.id} className="space-y-2">
              <Label htmlFor={input.id} className="flex items-center gap-2">
                {input.label}
                {input.id !== 'approval_required' && (
                  <Badge variant="outline" className="text-xs">Required</Badge>
                )}
              </Label>
              {renderInput(input)}
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-700">{previewPrompt}</p>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <Button onClick={handleRun} className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Run Template
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
