
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TaskSubmission } from '@/components/TaskSubmission';
import { TemplateManager } from '@/components/TemplateManager';
import { RunHistory } from '@/components/RunHistory';
import { Dashboard } from '@/components/Dashboard';
import { WorkflowBuilder } from '@/components/workflows/WorkflowBuilder';
import { UserSettings } from '@/components/settings/UserSettings';
import { KeyboardShortcutProvider, useKeyboardShortcuts } from '@/contexts/KeyboardShortcutContext';
import { ShortcutOverlay } from '@/components/shortcuts/ShortcutOverlay';
import { CommandPalette } from '@/components/shortcuts/CommandPalette';

const IndexContent = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  // Register navigation shortcuts
  useEffect(() => {
    const shortcuts = [
      { key: 'Ctrl+1', description: 'Go to Dashboard', action: () => setActiveView('dashboard'), category: 'navigation' as const },
      { key: 'Ctrl+2', description: 'Go to Quick Tasks', action: () => setActiveView('tasks'), category: 'navigation' as const },
      { key: 'Ctrl+3', description: 'Go to Workflow Builder', action: () => setActiveView('workflows'), category: 'navigation' as const },
      { key: 'Ctrl+4', description: 'Go to Templates', action: () => setActiveView('templates'), category: 'navigation' as const },
      { key: 'Ctrl+5', description: 'Go to History & Monitor', action: () => setActiveView('history'), category: 'navigation' as const },
      { key: 'Ctrl+6', description: 'Go to Settings', action: () => setActiveView('settings'), category: 'navigation' as const },
      { key: 'Ctrl+n', description: 'New Task/Workflow', action: () => {
        if (activeView === 'workflows') {
          // Trigger new workflow creation
        } else {
          setActiveView('tasks');
        }
      }, category: 'actions' as const },
    ];

    shortcuts.forEach(shortcut => registerShortcut(shortcut));

    return () => {
      shortcuts.forEach(shortcut => unregisterShortcut(shortcut.key));
    };
  }, [registerShortcut, unregisterShortcut, activeView]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskSubmission />;
      case 'workflows':
        return <WorkflowBuilder />;
      case 'templates':
        return <TemplateManager />;
      case 'history':
        return <RunHistory />;
      case 'settings':
        return <UserSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-hidden">
        {renderActiveView()}
      </main>
      <ShortcutOverlay />
      <CommandPalette onNavigate={setActiveView} />
    </div>
  );
};

const Index = () => {
  return (
    <KeyboardShortcutProvider>
      <IndexContent />
    </KeyboardShortcutProvider>
  );
};

export default Index;
