
import { useState, useEffect } from 'react';
import { useKeyboardShortcuts } from '@/contexts/KeyboardShortcutContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Play, Workflow, FileText, History, BarChart3, LayoutDashboard } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  onNavigate: (view: string) => void;
}

export const CommandPalette = ({ onNavigate }: CommandPaletteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      action: () => { onNavigate('dashboard'); setIsOpen(false); },
      category: 'Navigation'
    },
    {
      id: 'quick-tasks',
      label: 'Go to Quick Tasks',
      icon: <Play className="w-4 h-4" />,
      action: () => { onNavigate('tasks'); setIsOpen(false); },
      category: 'Navigation'
    },
    {
      id: 'workflow-builder',
      label: 'Go to Workflow Builder',
      icon: <Workflow className="w-4 h-4" />,
      action: () => { onNavigate('workflows'); setIsOpen(false); },
      category: 'Navigation'
    },
    {
      id: 'templates',
      label: 'Go to Templates',
      icon: <FileText className="w-4 h-4" />,
      action: () => { onNavigate('templates'); setIsOpen(false); },
      category: 'Navigation'
    },
    {
      id: 'history',
      label: 'Go to History',
      icon: <History className="w-4 h-4" />,
      action: () => { onNavigate('history'); setIsOpen(false); },
      category: 'Navigation'
    },
    {
      id: 'analytics',
      label: 'Go to Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      action: () => { onNavigate('analytics'); setIsOpen(false); },
      category: 'Navigation'
    },
  ];

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    registerShortcut({
      key: 'Ctrl+k',
      description: 'Open command palette',
      action: () => setIsOpen(true),
      category: 'search'
    });

    return () => unregisterShortcut('Ctrl+k');
  }, [registerShortcut, unregisterShortcut]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 max-w-lg">
        <div className="flex items-center border-b px-3">
          <Search className="w-4 h-4 mr-2 text-gray-500" />
          <Input
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus:ring-0 focus:outline-none"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            <div className="p-2">
              {filteredCommands.map((command) => (
                <div
                  key={command.id}
                  onClick={command.action}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  {command.icon}
                  <div>
                    <div className="font-medium">{command.label}</div>
                    <div className="text-xs text-gray-500">{command.category}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No commands found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
