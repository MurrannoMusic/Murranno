import { Link } from "react-router-dom";
import { AvatarDropdown } from "./AvatarDropdown";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import mmLogo from "@/assets/mm_logo.png";

export const AppHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/app/dashboard" className="flex items-center">
          <img src={mmLogo} alt="Murranno Music" className="h-8" />
        </Link>
        
        <div className="flex items-center gap-2">
          <NotificationBell />
          <AvatarDropdown />
        </div>
      </div>
    </header>
  );
};
