
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Bot } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <Bot className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">SAP Copilot</span>
        </div>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled>
                <User className="w-4 h-4 mr-2" />
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};
