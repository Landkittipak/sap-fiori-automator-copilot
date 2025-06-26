import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { realWorkflowExecutionService } from '@/services/RealWorkflowExecutionService';
import { workflowService } from '@/services/WorkflowService';
import { PlayCircle, Settings, Globe } from 'lucide-react';

interface CuaWorkflowExecutionProps {
  templateId: string;
  onExecutionStart: (runId: string) => void;
}

export const CuaWorkflowExecution = ({ templateId, onExecutionStart }: CuaWorkflowExecutionProps) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [sapFioriUrl, setSapFioriUrl] = useState('');
  const [templateInputs, setTemplateInputs] = useState<Record<string, string>>({});
  const [customInputKey, setCustomInputKey] = useState('');
  const [customInputValue, setCustomInputValue] = useState('');
  const { toast } = useToast();

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      // Get workflow steps from the template
      const steps = await workflowService.getWorkflowSteps(templateId);
      
      if (steps.length === 0) {
        toast({
          title: "No Steps Defined",
          description: "Please add workflow steps before executing",
          variant: "destructive",
        });
        return;
      }

      // Start real execution
      const runId = await realWorkflowExecutionService.executeWorkflow(
        steps,
        templateInputs,
        sapFioriUrl || undefined
      );

      toast({
        title: "Execution Started",
        description: `Workflow execution started with ID: ${runId}`,
      });

      onExecutionStart(runId);
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Failed to start execution",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const addCustomInput = () => {
    if (customInputKey && customInputValue) {
      setTemplateInputs(prev => ({
        ...prev,
        [customInputKey]: customInputValue
      }));
      setCustomInputKey('');
      setCustomInputValue('');
    }
  };

  const removeInput = (key: string) => {
    setTemplateInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[key];
      return newInputs;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5" />
          Execute Workflow with CUA
        </CardTitle>
        <CardDescription>
          Run your workflow using real browser automation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* SAP Fiori URL Configuration */}
        <div className="space-y-2">
          <Label htmlFor="sap-url" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            SAP Fiori URL (optional)
          </Label>
          <Input
            id="sap-url"
            placeholder="https://your-public-sap-fiori-url.com or leave empty for default"
            value={sapFioriUrl}
            onChange={(e) => setSapFioriUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Use ngrok or similar to expose your local SAP Fiori to CUA cloud agents
          </p>
        </div>

        {/* Template Inputs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <Label>Template Variables</Label>
          </div>
          
          {/* Existing inputs */}
          {Object.entries(templateInputs).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <Input value={key} disabled className="flex-1" />
              <Input 
                value={value} 
                onChange={(e) => setTemplateInputs(prev => ({ ...prev, [key]: e.target.value }))}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => removeInput(key)}
              >
                Remove
              </Button>
            </div>
          ))}

          {/* Add new input */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Variable name (e.g., username)"
              value={customInputKey}
              onChange={(e) => setCustomInputKey(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Variable value"
              value={customInputValue}
              onChange={(e) => setCustomInputValue(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={addCustomInput}
              disabled={!customInputKey || !customInputValue}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Execution Button */}
        <div className="pt-4 border-t">
          <Button 
            onClick={handleExecute}
            disabled={isExecuting}
            className="w-full"
            size="lg"
          >
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting CUA Agent...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Execute Workflow
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>How it works:</strong></p>
          <p>1. A CUA agent starts in a cloud VM with a fresh browser</p>
          <p>2. The agent navigates to your SAP Fiori URL</p>
          <p>3. Each workflow step is executed with real mouse/keyboard actions</p>
          <p>4. You can monitor progress in real-time</p>
        </div>
      </CardContent>
    </Card>
  );
};