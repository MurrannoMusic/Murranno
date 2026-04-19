import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { AvatarDropdown } from "./AvatarDropdown";
import mmLogo from "@/assets/mm_logo.png";

interface TwoTierHeaderProps {
  title: string;
  backTo?: string;
  onBack?: () => void;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
}

export const TwoTierHeader = ({ 
  title, 
  backTo, 
  onBack, 
  actionIcon, 
  onAction 
}: TwoTierHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
      {/* Top Tier: Logo, Notifications, Avatar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
        <Link to="/app/dashboard" className="flex items-center">
          <img src={mmLogo} alt="Murranno Music" className="h-8" />
        </Link>
        
        <div className="flex items-center gap-2">
          <NotificationBell />
          <AvatarDropdown />
        </div>
      </div>

      {/* Bottom Tier: Back Button, Title Badge, Action Icon */}
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="hover:bg-secondary/30"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <Badge variant="outline" className="text-xs font-medium">
          {title}
        </Badge>

        {actionIcon && onAction ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="hover:bg-secondary/30"
          >
            {actionIcon}
          </Button>
        ) : (
          <div className="w-8" /> // Spacer for alignment
        )}
      </div>
    </header>
  );
};
