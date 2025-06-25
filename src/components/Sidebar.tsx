
import { 
  LayoutDashboard, 
  Zap, 
  GitBranch, 
  FileText, 
  History, 
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Quick Tasks', icon: Zap },
  { id: 'workflows', label: 'Workflows', icon: GitBranch },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'history', label: 'History & Monitor', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  return (
    <div className="w-64 bg-card border-r border-border h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Navigation</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
