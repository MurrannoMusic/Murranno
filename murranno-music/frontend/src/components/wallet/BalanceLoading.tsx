import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const BalanceLoading = () => {
  return (
    <div className="space-y-4">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-[20px] p-4 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-12 h-4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-[20px] p-4 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-12 h-4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>

      {/* Available Balance Card Skeleton */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-40" />
            </div>
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Earnings Sources Skeleton */}
      <Card className="bg-card border border-border rounded-[20px] shadow-soft">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
