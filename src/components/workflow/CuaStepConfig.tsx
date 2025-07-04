import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap } from 'lucide-react';
import CuaService from '@/services/CuaService';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

// Create a singleton instance
const cuaService = new CuaService();

interface CuaAutomation {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

interface CuaStepConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  initialConfig?: any;
}

export const CuaStepConfig = ({ isOpen, onClose, onSave, initialConfig }: CuaStepConfigProps) => {
  const [automations, setAutomations] = useState<CuaAutomation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState(initialConfig?.automationId || '');
  const [inputs, setInputs] = useState(initialConfig?.inputs || '{}');
  const [waitForCompletion, setWaitForCompletion] = useState(initialConfig?.waitForCompletion || true);
  const [description, setDescription] = useState(initialConfig?.description || '');
  const [advancedMode, setAdvancedMode] = useState(false);
  const { toast } = useToast();
  const [customActionType, setCustomActionType] = useState('type');
  const [customActionValue, setCustomActionValue] = useState('');
  const CUSTOM_ACTION_ID = '__custom_action__';

  useEffect(() => {
    if (isOpen) {
      loadAutomations();
    }
  }, [isOpen]);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const data = await cuaService.getAutomations();
      setAutomations(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Cua automations. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    try {
      let config;
      if (selectedAutomation === CUSTOM_ACTION_ID) {
        config = {
          type: 'core',
          action: customActionType,
          value: customActionValue,
          waitForCompletion,
          description: description || `Custom core automation: ${customActionType} ${customActionValue}`,
        };
      } else {
      const parsedInputs = inputs ? JSON.parse(inputs) : {};
        config = {
        automationId: selectedAutomation,
        inputs: parsedInputs,
        waitForCompletion,
        description: description || `Trigger Cua automation`,
      };
      }
      onSave(config);
      onClose();
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your inputs JSON format",
        variant: "destructive",
      });
    }
  };

  const selectedAutomationDetails = automations.find(a => a.id === selectedAutomation);

  // Helper: Render user-friendly fields for common automations
  const renderInputsForm = () => {
    if (!selectedAutomationDetails) return null;
    // Example: Use automation name to determine fields
    if (selectedAutomationDetails.name.toLowerCase().includes('type')) {
      return (
        <div>
          <Label>Text to type</Label>
          <Input
            value={JSON.parse(inputs || '{}').text || ''}
            onChange={e => setInputs(JSON.stringify({ ...JSON.parse(inputs || '{}'), text: e.target.value }))}
            placeholder="e.g. MM60"
          />
        </div>
      );
    }
    if (selectedAutomationDetails.name.toLowerCase().includes('press')) {
      return (
        <Select value={inputs.key || ''} onValueChange={val => setInputs(JSON.stringify({ ...JSON.parse(inputs || '{}'), key: val }))}>
          <SelectTrigger><SelectValue placeholder="Key to press" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="enter">Enter</SelectItem>
            <SelectItem value="tab">Tab</SelectItem>
            <SelectItem value="escape">Escape</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    if (selectedAutomationDetails.name.toLowerCase().includes('click')) {
      return (
        <div>
          <Label>Element selector</Label>
          <Input
            value={JSON.parse(inputs || '{}').selector || ''}
            onChange={e => setInputs(JSON.stringify({ ...JSON.parse(inputs || '{}'), selector: e.target.value }))}
            placeholder="e.g. #submitBtn"
          />
        </div>
      );
    }
    // Default: show nothing
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Configure Cua Automation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Automation</Label>
            <Select value={selectedAutomation} onValueChange={setSelectedAutomation}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading automations..." : "Select a Cua automation"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CUSTOM_ACTION_ID}>
                  <div className="flex items-center gap-2">
                    <span>Custom Action</span>
                    <Badge variant="default">core</Badge>
                  </div>
                </SelectItem>
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </div>
                ) : (
                  automations.map((automation) => (
                    <SelectItem key={automation.id} value={automation.id}>
                      <div className="flex items-center gap-2">
                        <span>{automation.name}</span>
                        <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                          {automation.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedAutomationDetails?.description && (
              <p className="text-sm text-gray-600 mt-1">{selectedAutomationDetails.description}</p>
            )}
          </div>

          <div>
            <Label>Description (Optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this step does..."
            />
          </div>

          {/* User-friendly input fields */}
          {!advancedMode && (
            selectedAutomation === CUSTOM_ACTION_ID ? (
              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select value={customActionType} onValueChange={setCustomActionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type">Type Text</SelectItem>
                    <SelectItem value="press">Press Key</SelectItem>
                    <SelectItem value="click">Click</SelectItem>
                  </SelectContent>
                </Select>
                <Label>Value</Label>
                <Input
                  value={customActionValue}
                  onChange={e => setCustomActionValue(e.target.value)}
                  placeholder={customActionType === 'type' ? 'e.g. MM60' : customActionType === 'press' ? 'e.g. enter' : 'e.g. #submitBtn'}
                />
              </div>
            ) : renderInputsForm()
          )}

          {/* Advanced mode toggle */}
          <div className="flex items-center space-x-2">
            <Switch id="advancedMode" checked={advancedMode} onCheckedChange={setAdvancedMode} />
            <Label htmlFor="advancedMode">Advanced (edit raw JSON)</Label>
          </div>

          {/* Raw JSON textarea for advanced users */}
          {advancedMode && (
          <div>
            <Label>Inputs (JSON)</Label>
            <Textarea
              value={inputs}
              onChange={(e) => setInputs(e.target.value)}
              placeholder='{"key": "value", "param": "data"}'
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide inputs as JSON. You can use template variables like {'{template_input_name}'}
            </p>
          </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="waitForCompletion"
              checked={waitForCompletion}
              onChange={(e) => setWaitForCompletion(e.target.checked)}
            />
            <Label htmlFor="waitForCompletion">Wait for automation to complete</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!selectedAutomation}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
