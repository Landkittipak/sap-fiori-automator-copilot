
import { useKeyboardShortcuts } from '@/contexts/KeyboardShortcutContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ShortcutOverlay = () => {
  const { shortcuts, showOverlay, setShowOverlay } = useKeyboardShortcuts();

  if (!showOverlay) return null;

  const categorizedShortcuts = {
    navigation: shortcuts.filter(s => s.category === 'navigation'),
    actions: shortcuts.filter(s => s.category === 'actions'),
    search: shortcuts.filter(s => s.category === 'search'),
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOverlay(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(categorizedShortcuts).map(([category, categoryShortcuts]) => (
            categoryShortcuts.length > 0 && (
              <div key={category}>
                <h3 className="font-semibold text-lg capitalize mb-3">{category}</h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between py-1">
                      <span className="text-sm">{shortcut.description}</span>
                      <Badge variant="outline" className="font-mono">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
          <div className="pt-4 border-t text-sm text-gray-500">
            Press <Badge variant="outline">Escape</Badge> or click outside to close
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
