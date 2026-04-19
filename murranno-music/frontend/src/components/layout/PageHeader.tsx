import { Link } from 'react-router-dom';
import mmLogo from "@/assets/mm_logo.png";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, backTo, actions }: PageHeaderProps) => {
  return (
    <div className="bg-gradient-dark backdrop-blur-xl border-b border-border/20 p-3 md:p-4 text-foreground mobile-safe-top">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {backTo && (
            <Link to={backTo} className="flex items-center flex-shrink-0">
              <img src={mmLogo} alt="Murranno Music" className="h-8" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-bold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground/80 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {actions}
        </div>
      </div>
    </div>
  );
};