import { User, Settings, Moon, Sun, Monitor, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/ThemeProvider';
import { useUserType } from '@/hooks/useUserType';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const AvatarDropdown = () => {
  const { theme, setTheme } = useTheme();
  const { currentUser } = useUserType();
  const { profile } = useArtistProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const ThemeIcon = ({ t, icon: Icon, label }: { t: 'light' | 'dark' | 'system', icon: any, label: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 rounded-full",
        theme === t && "bg-primary/20 text-primary"
      )}
      onClick={() => setTheme(t)}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
          <Avatar className="w-10 h-10 border-2 border-primary/30">
            <AvatarImage src={profile?.profile_image || ''} alt={currentUser.name} className="object-cover object-center h-full w-full" />
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
              {(currentUser.name || 'User').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-card/95 backdrop-blur-xl border border-border/30 shadow-primary z-[100]"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-foreground">
          {currentUser.name}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <Link to="/app/artist-profile">
          <DropdownMenuItem className="text-foreground hover:bg-secondary/50 cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Artist Profile
          </DropdownMenuItem>
        </Link>

        <Link to="/app/profile">
          <DropdownMenuItem className="text-foreground hover:bg-secondary/50 cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Account
          </DropdownMenuItem>
        </Link>

        <Link to="/app/settings">
          <DropdownMenuItem className="text-foreground hover:bg-secondary/50 cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <div className="p-2">
          <div className="flex items-center justify-center gap-2 p-1 bg-secondary/20 rounded-full border border-border/50">
            <ThemeIcon t="light" icon={Sun} label="Light" />
            <ThemeIcon t="dark" icon={Moon} label="Dark" />
            <ThemeIcon t="system" icon={Monitor} label="System" />
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-500 hover:bg-red-500/10 hover:text-red-600 cursor-pointer focus:bg-red-500/10 focus:text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};
