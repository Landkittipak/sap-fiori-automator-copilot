
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TaskSubmission } from '@/components/TaskSubmission';
import { TemplateManager } from '@/components/TemplateManager';
import { RunHistory } from '@/components/RunHistory';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskSubmission />;
      case 'templates':
        return <TemplateManager />;
      case 'history':
        return <RunHistory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-hidden">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default Index;
