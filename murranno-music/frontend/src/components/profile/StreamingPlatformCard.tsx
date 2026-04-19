import { useState } from 'react';
import { ExternalLink, Plus, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBrowser } from '@/hooks/useBrowser';

interface StreamingPlatformCardProps {
  name: string;
  icon: React.ReactNode;
  url: string | null;
  onUpdate: (url: string | null) => void;
  isEditing: boolean;
  placeholder: string;
  type?: 'streaming' | 'social';
}

export const StreamingPlatformCard = ({
  name,
  icon,
  url,
  onUpdate,
  isEditing,
  placeholder,
  type = 'streaming',
}: StreamingPlatformCardProps) => {
  const [editValue, setEditValue] = useState(url || '');
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const { openStreamingPlatform, openSocialMedia } = useBrowser();

  const handleSave = () => {
    onUpdate(editValue.trim() || null);
    setIsLocalEditing(false);
  };

  const handleCancel = () => {
    setEditValue(url || '');
    setIsLocalEditing(false);
  };

  const handleOpenLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (url) {
      if (type === 'social') {
        openSocialMedia(name, url);
      } else {
        openStreamingPlatform(name, url);
      }
    }
  };

  if (isEditing || isLocalEditing) {
    return (
      <Card className="bg-secondary/20 border border-border rounded-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-foreground">{icon}</div>
            <span className="text-sm font-medium text-card-foreground">{name}</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="bg-background border-border text-sm h-8"
            />
            <Button size="sm" onClick={handleSave} className="shrink-0 h-8 w-8 p-0">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="shrink-0 h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary/20 border border-border rounded-lg hover:bg-secondary/30 transition-smooth">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-foreground shrink-0">{icon}</div>
            <div>
              <div className="text-sm font-medium text-card-foreground">{name}</div>
              {url ? (
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0">
                  <Check className="w-2.5 h-2.5 text-success" />
                  Connected
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground/50 mt-0">Not connected</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {url ? (
              <button
                onClick={handleOpenLink}
                className="text-muted-foreground hover:text-foreground transition-smooth p-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsLocalEditing(true)}
                className="hover:bg-secondary/30 h-7 w-7 p-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
