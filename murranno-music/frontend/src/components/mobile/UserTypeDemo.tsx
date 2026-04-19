import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Megaphone } from 'lucide-react';
import { useUserType } from '@/hooks/useUserType';
import { UserType } from '@/types/user';

export const UserTypeDemo = () => {
  const { currentUserType, switchUserType } = useUserType();

  const userTypes: { type: UserType; label: string; icon: any; color: string }[] = [
    { type: 'artist', label: 'Artist', icon: User, color: 'bg-primary' },
    { type: 'label', label: 'Label', icon: Building2, color: 'bg-secondary' },
    { type: 'agency', label: 'Agency', icon: Megaphone, color: 'bg-accent' }
  ];

  return (
    <Card className="glass-card mb-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Demo Mode - Switch User Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {userTypes.map(({ type, label, icon: Icon, color }) => (
            <Button
              key={type}
              onClick={() => switchUserType(type)}
              variant={currentUserType === type ? "default" : "outline"}
              size="sm"
              className="flex-1 h-8"
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
        <Badge variant="secondary" className="mt-2 text-xs">
          Current: {userTypes.find(t => t.type === currentUserType)?.label}
        </Badge>
      </CardContent>
    </Card>
  );
};