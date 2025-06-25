
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  FileText, 
  History, 
  LayoutDashboard,
  User,
  Settings,
  Play,
  Workflow
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'Ctrl+1' },
    { id: 'tasks', label: 'Quick Tasks', icon: Play, shortcut: 'Ctrl+2', description: 'Single, immediate executions' },
    { id: 'workflows', label: 'Workflow Builder', icon: Workflow, shortcut: 'Ctrl+3', description: 'Multi-step automations', badge: 'New' },
    { id: 'templates', label: 'Templates', icon: FileText, shortcut: 'Ctrl+4' },
    { id: 'history', label: 'Run History', icon: History, shortcut: 'Ctrl+5' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">SAP Copilot</h1>
            <p className="text-sm text-gray-500">Automation Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <div key={item.id} className="relative group">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left relative",
                  isActive && "bg-blue-50 text-blue-700 border-blue-200"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-500 truncate">
                      {item.description}
                    </div>
                  )}
                </div>
              </Button>
              
              {/* Tooltip with shortcut */}
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
                {item.shortcut && (
                  <span className="ml-2 bg-gray-700 px-1 rounded">{item.shortcut}</span>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3 mb-3">
          <h4 className="font-medium text-blue-900 text-sm mb-1">Keyboard Shortcuts</h4>
          <p className="text-blue-700 text-xs mb-2">Press <kbd className="bg-blue-200 px-1 rounded">?</kbd> to see all shortcuts</p>
          <p className="text-blue-700 text-xs">Press <kbd className="bg-blue-200 px-1 rounded">Ctrl+K</kbd> for command palette</p>
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">demo@company.com</p>
            <p className="text-xs text-gray-500">SAP Admin</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};
