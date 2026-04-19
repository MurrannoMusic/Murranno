import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { supabase } from '@/integrations/supabase/client';
import { Check, Loader2, AlertCircle, ArrowLeft, Music, Building2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const { user, subscriptions, accessibleTiers, refreshUserData } = useAuth();
  const { data: plans, isLoading } = useSubscriptionPlans();
  const [addingTier, setAddingTier] = useState<string | null>(null);

  const handleAddSubscription = async (tier: 'label' | 'agency') => {
    if (!user?.email) {
      toast.error('User email not found');
      return;
    }

    setAddingTier(tier);

    try {
      const { data, error } = await supabase.functions.invoke('paystack-initialize-subscription', {
        body: { 
          tier, 
          email: user.email,
          full_name: user.user_metadata?.full_name || ''
        }
      });

      if (error) throw error;

      if (data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else if (data?.redirect_url) {
        // Free subscription activated
        toast.success(data.message || `${tier} access added!`);
        await refreshUserData();
        navigate(data.redirect_url);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to add subscription');
      setAddingTier(null);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'artist':
        return <Music className="w-6 h-6" />;
      case 'label':
        return <Building2 className="w-6 h-6" />;
      case 'agency':
        return <Briefcase className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const getTierSubscription = (tier: string) => {
    return subscriptions.find(sub => sub.tier === tier);
  };

  const getStatusForTier = (tier: string) => {
    const sub = getTierSubscription(tier);
    if (!sub) return 'not_subscribed';
    
    if (sub.status === 'active') return 'active';
    if (sub.status === 'trial' && sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date()) return 'trial';
    return 'expired';
  };

  return (
    <div className="dark min-h-screen bg-gradient-mesh overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto p-4 space-y-6 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/app/artist-dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/app/settings')}
          >
            Settings
          </Button>
        </div>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Flexible Subscription Model</p>
              <p className="text-sm">Artist access is always free. Add Label or Agency subscriptions as independent add-ons to unlock additional features.</p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Active Subscriptions */}
        {subscriptions.length > 0 && (
          <Card className="border-border/40">
            <CardContent className="p-6">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground font-semibold">Your Active Subscriptions</p>
                <div className="space-y-2">
                  {subscriptions.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                      <div className="flex items-center gap-3">
                        {getTierIcon(sub.tier)}
                        <div>
                          <p className="font-medium capitalize">{sub.tier} Access</p>
                          <p className="text-xs text-muted-foreground">
                            {sub.status === 'trial' ? 'Trial' : 'Active'} • 
                            {sub.current_period_end ? ` Renews ${new Date(sub.current_period_end).toLocaleDateString()}` : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant={sub.isActive ? 'default' : 'secondary'} className="capitalize">
                        {sub.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Subscription Plans</h2>
            <p className="text-sm text-muted-foreground">Add the features you need, when you need them</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Artist (Always Free) */}
              <Card className="border-2 border-primary/40 bg-primary/5">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <Music className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Artist</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-3xl font-bold text-foreground">Free</span>
                    <span className="text-muted-foreground">/forever</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Upload & distribute music</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Track analytics</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Earnings dashboard</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Promotion services</span>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline" disabled>
                    Always Included
                  </Button>
                </CardContent>
              </Card>

              {/* Label & Agency Plans */}
              {plans?.map((plan) => {
                const hasAccess = accessibleTiers.includes(plan.tier);
                const status = getStatusForTier(plan.tier);
                const isAdding = addingTier === plan.tier;

                return (
                  <Card
                    key={plan.id}
                    className={`border-2 ${
                      hasAccess
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-border/40'
                    }`}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-2">
                        {getTierIcon(plan.tier)}
                      </div>
                      <CardTitle className="text-xl capitalize">{plan.name}</CardTitle>
                      <div className="flex items-baseline justify-center gap-1 mt-2">
                        <span className="text-3xl font-bold text-foreground">
                          ₦{plan.price_monthly.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features?.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className="w-full"
                        variant={hasAccess ? 'outline' : 'default'}
                        disabled={hasAccess || isAdding}
                        onClick={() => handleAddSubscription(plan.tier as 'label' | 'agency')}
                      >
                        {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {hasAccess
                          ? status === 'active' ? 'Active Subscription' : 'Subscription Expired'
                          : isAdding
                          ? 'Processing...'
                          : 'Add Access'
                        }
                      </Button>

                      {hasAccess && status !== 'expired' && (
                        <p className="text-xs text-center text-muted-foreground">
                          Access granted • Switch dashboards via avatar menu
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Help Section */}
        <Card className="border-border/40 bg-secondary/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help choosing a plan? <Button variant="link" className="p-0 h-auto text-primary">Contact support</Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
