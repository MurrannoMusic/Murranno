import { formatDistanceToNow } from "date-fns";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
  notification: Notification;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const colorMap = {
  info: "text-blue-500",
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
};

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();
  const Icon = iconMap[notification.type];

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate to related content if available
    if (notification.related_type && notification.related_id) {
      switch (notification.related_type) {
        case 'campaign':
          navigate('/campaign-tracking');
          break;
        case 'release':
          navigate('/releases');
          break;
        case 'payout':
          navigate('/earnings');
          break;
        default:
          break;
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left px-4 py-3 hover:bg-accent transition-colors",
        !notification.is_read && "bg-accent/50"
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", colorMap[notification.type])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-medium text-sm">{notification.title}</p>
            {!notification.is_read && (
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </button>
  );
};
