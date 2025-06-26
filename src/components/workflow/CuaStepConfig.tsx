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
  const { toast } = useToast();

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
      const parsedInputs = inputs ? JSON.parse(inputs) : {};
      
      const config = {
        automationId: selectedAutomation,
        inputs: parsedInputs,
        waitForCompletion,
        description: description || `Trigger Cua automation`,
      };

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
