
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Database } from '@/integrations/supabase/types';
import type { WorkflowStepConfig } from '@/services/WorkflowService';

type WorkflowStep = Database['public']['Tables']['workflow_steps']['Row'];

interface StepConfigDialogProps {
  step: WorkflowStep | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (stepId: string, config: WorkflowStepConfig, name?: string) => void;
}

export const StepConfigDialog = ({ step, isOpen, onClose, onSave }: StepConfigDialogProps) => {
  const [config, setConfig] = useState<WorkflowStepConfig>(
    step?.step_config as WorkflowStepConfig || {}
  );
  const [stepName, setStepName] = useState(step?.step_type || '');

  const handleSave = () => {
    if (!step) return;
    onSave(step.id, config, stepName);
    onClose();
  };

  const renderConfigFields = () => {
    if (!step) return null;

    switch (step.step_type) {
      case 'action':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="action-type">Action Type</Label>
              <Select 
                value={config.action || ''} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, action: value }))}
              >
                <SelectTrigger id="action-type">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="click">Click</SelectItem>
                  <SelectItem value="type">Type Text</SelectItem>
                  <SelectItem value="select">Select Option</SelectItem>
                  <SelectItem value="wait">Wait</SelectItem>
                  <SelectItem value="navigate">Navigate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="selector">Element Selector</Label>
              <Input
                id="selector"
                placeholder="CSS selector or element ID"
                value={config.selector || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, selector: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                placeholder="Value to input or URL to navigate to"
                value={config.value || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, value: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this action does"
                value={config.description || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition-type">Condition Type</Label>
              <Select 
                value={config.conditionType || ''} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, conditionType: value }))}
              >
                <SelectTrigger id="condition-type">
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="element-exists">Element Exists</SelectItem>
                  <SelectItem value="element-visible">Element Visible</SelectItem>
                  <SelectItem value="text-contains">Text Contains</SelectItem>
                  <SelectItem value="value-equals">Value Equals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="selector">Element Selector</Label>
              <Input
                id="selector"
                placeholder="CSS selector to check"
                value={config.selector || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, selector: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="expected-value">Expected Value</Label>
              <Input
                id="expected-value"
                placeholder="Expected text or value"
                value={config.expectedValue || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, expectedValue: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this condition"
                value={config.description || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'validation':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="validation-rule">Validation Rule</Label>
              <Select 
                value={config.validation?.rule || ''} 
                onValueChange={(value) => setConfig(prev => ({
                  ...prev,
                  validation: { ...prev.validation, rule: value, type: 'element' }
                }))}
              >
                <SelectTrigger id="validation-rule">
                  <SelectValue placeholder="Select validation rule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toBeVisible">To Be Visible</SelectItem>
                  <SelectItem value="toHaveText">To Have Text</SelectItem>
                  <SelectItem value="toBeEnabled">To Be Enabled</SelectItem>
                  <SelectItem value="toBeDisabled">To Be Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="selector">Element Selector</Label>
              <Input
                id="selector"
                placeholder="Element to validate"
                value={config.selector || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, selector: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="expected-text">Expected Text (if applicable)</Label>
              <Input
                id="expected-text"
                placeholder="Expected text content"
                value={config.expectedText || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, expectedText: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Wait time in seconds"
                value={config.duration || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Why is this delay needed?"
                value={config.description || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'loop':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="iterations">Number of Iterations</Label>
              <Input
                id="iterations"
                type="number"
                placeholder="How many times to repeat"
                value={config.value || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, value: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this loop do?"
                value={config.description || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Step description"
              value={config.description || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Configure {step?.step_type ? step.step_type.charAt(0).toUpperCase() + step.step_type.slice(1) : 'Step'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="step-name">Step Name</Label>
            <Input
              id="step-name"
              placeholder="Give this step a name"
              value={stepName}
              onChange={(e) => setStepName(e.target.value)}
            />
          </div>

          {renderConfigFields()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
