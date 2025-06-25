
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ShortcutAction {
  key: string;
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'search';
}

interface KeyboardShortcutContextType {
  shortcuts: ShortcutAction[];
  registerShortcut: (shortcut: ShortcutAction) => void;
  unregisterShortcut: (key: string) => void;
  showOverlay: boolean;
  setShowOverlay: (show: boolean) => void;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType | undefined>(undefined);

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutProvider');
  }
  return context;
};

export const KeyboardShortcutProvider = ({ children }: { children: React.ReactNode }) => {
  const [shortcuts, setShortcuts] = useState<ShortcutAction[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);

  const registerShortcut = (shortcut: ShortcutAction) => {
    setShortcuts(prev => [...prev.filter(s => s.key !== shortcut.key), shortcut]);
  };

  const unregisterShortcut = (key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show shortcut overlay with '?'
      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setShowOverlay(true);
        return;
      }

      // Hide overlay on Escape
      if (event.key === 'Escape') {
        setShowOverlay(false);
        return;
      }

      // Find matching shortcut
      const shortcutKey = `${event.ctrlKey || event.metaKey ? 'Ctrl+' : ''}${event.altKey ? 'Alt+' : ''}${event.shiftKey ? 'Shift+' : ''}${event.key}`;
      const matchedShortcut = shortcuts.find(s => s.key === shortcutKey);

      if (matchedShortcut) {
        event.preventDefault();
        matchedShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <KeyboardShortcutContext.Provider value={{
      shortcuts,
      registerShortcut,
      unregisterShortcut,
      showOverlay,
      setShowOverlay
    }}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
};
