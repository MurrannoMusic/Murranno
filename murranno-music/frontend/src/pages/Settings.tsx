import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Bell, User, Lock, HelpCircle, CreditCard, LogOut, Mail, Fingerprint, RefreshCw, Calendar, CheckCircle2, AlertCircle, ShieldCheck, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import mmLogo from "@/assets/mm_logo.png";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChangeEmailDialog } from '@/components/settings/ChangeEmailDialog';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';
import { BadgeSettings } from '@/components/settings/BadgeSettings';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Loader2 } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import { useUserSubscriptions } from '@/hooks/useUserSubscriptions';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useWalletSecurity } from '@/hooks/useWalletSecurity';
import { TransactionPinDialog } from '@/components/wallet/TransactionPinDialog';
import { SecurityActivityLog } from '@/components/settings/SecurityActivityLog';

export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { preferences, isLoading, updatePreference } = useNotificationPreferences();
  const { checkAvailability, getBiometryName } = useBiometricAuth();
  const { currentVersion, checkForUpdate, isChecking, updateAvailable, performImmediateUpdate } = useAppUpdate();
  const { data: subscriptionData, isLoading: isSubLoading } = useUserSubscriptions();
  const { formatCurrency } = useCurrency();

  const activeSubscription = subscriptionData?.subscriptions.find(sub => sub.isActive);
  const planDetails = activeSubscription?.subscription_plans;

  // Dialog states
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Biometric states
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');

  // Wallet Security
  const { hasPin, setupPin, refetch: refetchSecurity } = useWalletSecurity();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);

  useEffect(() => {
    const checkBiometric = async () => {
      const availability = await checkAvailability();
      setBiometricAvailable(availability.isAvailable);
      if (availability.isAvailable) {
        setBiometricType(getBiometryName(availability.biometryType));
      }
    };

    const savedBiometric = localStorage.getItem('biometric_enabled');
    setBiometricEnabled(savedBiometric === 'true');

    checkBiometric();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="smooth-scroll">
      {/* Top Bar removed - using UnifiedTopBar */}

      <div className="mobile-container space-y-3 mt-2 pb-16">
        {/* Account Management */}
        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 p-3 pt-0">
            <Link to="/app/profile">
              <button className="w-full flex items-center gap-3 p-2.5 bg-secondary/10 rounded-lg border border-border/50 hover:bg-secondary/20 transition-all text-left">
                <User className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-card-foreground">Edit Profile</span>
              </button>
            </Link>

            <button
              onClick={() => setEmailDialogOpen(true)}
              className="w-full flex items-center gap-3 p-2.5 bg-secondary/10 rounded-lg border border-border/50 hover:bg-secondary/20 transition-all text-left"
            >
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-card-foreground">Change Email</span>
            </button>

            <button
              onClick={() => setPasswordDialogOpen(true)}
              className="w-full flex items-center gap-3 p-2.5 bg-secondary/10 rounded-lg border border-border/50 hover:bg-secondary/20 transition-all text-left"
            >
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-card-foreground">Change Password</span>
            </button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3 pt-0">
            {isSubLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : activeSubscription ? (
              <>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h3 className="font-bold text-base text-primary leading-tight">{planDetails?.name || 'Pro Plan'}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-emerald-500/10 text-emerald-500 border-0">
                          Active
                        </Badge>
                        {activeSubscription.isTrial && (
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-amber-500/10 text-amber-500 border-0">
                            Trial
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base leading-tight">{formatCurrency(planDetails?.price_monthly || 0)}</p>
                      <p className="text-[10px] text-muted-foreground">/ month</p>
                    </div>
                  </div>

                  {activeSubscription.current_period_end && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground bg-background/40 p-1.5 rounded-md">
                      <Calendar className="h-3 w-3" />
                      <span>Renews {new Date(activeSubscription.current_period_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link to="/app/subscription/plans" className="col-span-2">
                    <Button variant="outline" size="sm" className="w-full flex justify-between h-8 text-xs">
                      <span>Change Plan</span>
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </Link>
                  <Button variant="ghost" className="text-[10px] text-muted-foreground h-7 py-0">
                    Payment Methods
                  </Button>
                  <Button variant="ghost" className="text-[10px] text-muted-foreground h-7 py-0">
                    Billing History
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-2 space-y-2">
                <div className="p-2 bg-secondary/20 rounded-full w-fit mx-auto">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xs font-medium">No Active Subscription</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Upgrade to unlock premium features</p>
                </div>
                <Link to="/app/subscription/plans">
                  <Button size="sm" className="w-full h-8 text-xs">View Plans</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 p-3 pt-0">
            {/* PIN Setup */}
            <div className="p-2.5 bg-secondary/10 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-card-foreground">Transaction PIN</p>
                    <p className="text-[10px] text-muted-foreground">{hasPin ? 'PIN is active' : 'PIN not set'}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={hasPin ? "outline" : "default"}
                  className="h-7 text-[10px]"
                  onClick={() => setShowPinDialog(true)}
                >
                  {hasPin ? 'Change PIN' : 'Set PIN'}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Required for withdrawals and bank account modifications.
              </p>
            </div>

            {/* Biometric */}
            {biometricAvailable && (
              <div className="flex items-center justify-between p-2.5 bg-secondary/10 rounded-lg border border-border/50">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-card-foreground">{biometricType} Login</p>
                  <p className="text-[10px] text-muted-foreground">Use biometrics to log in</p>
                </div>
                <Switch
                  checked={biometricEnabled}
                  className="scale-75"
                  onCheckedChange={(checked) => {
                    setBiometricEnabled(checked);
                    localStorage.setItem('biometric_enabled', String(checked));
                    toast.success(checked ? 'Biometric enabled' : 'Biometric disabled');
                  }}
                />
              </div>
            )}

            {/* Security Logs Toggle */}
            <div className="pt-2 border-t border-border/50">
              <button
                onClick={() => setShowSecurityLogs(!showSecurityLogs)}
                className="w-full flex items-center justify-between p-2 flex items-center gap-2 hover:bg-secondary/10 rounded-lg transition-all"
              >
                <div className="flex items-center gap-2">
                  <History className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground">Recent Security Activity</span>
                </div>
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-secondary/20">
                  {showSecurityLogs ? 'Hide' : 'Show'}
                </Badge>
              </button>

              {showSecurityLogs && <SecurityActivityLog />}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 p-3 pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {[
                  { id: 'email_notifications', label: 'Email Notifications', sub: 'Receive updates via email' },
                  { id: 'push_notifications', label: 'Push Notifications', sub: 'Get real-time alerts' },
                  { id: 'in_app_notifications', label: 'In-App Notifications', sub: 'Show alerts in app' },
                  { id: 'release_updates', label: 'Release Updates', sub: 'Track status changes' },
                  { id: 'campaign_updates', label: 'Campaign Updates', sub: 'Promotion updates' },
                  { id: 'earnings_alerts', label: 'Earnings Alerts', sub: 'Payment notifications' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-secondary/10 rounded-lg border border-border/50">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-card-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                    </div>
                    <Switch
                      checked={!!preferences?.[item.id as keyof typeof preferences]}
                      className="scale-75"
                      onCheckedChange={(checked) => updatePreference(item.id as any, checked)}
                    />
                  </div>
                ))}

                <div className="flex items-center justify-between p-2.5 bg-secondary/10 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-card-foreground">Marketing Emails</p>
                    <p className="text-[10px] text-muted-foreground">Product offers</p>
                  </div>
                  <Switch
                    checked={preferences?.marketing_emails ?? false}
                    className="scale-75"
                    onCheckedChange={(checked) => updatePreference('marketing_emails', checked)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Moon className="h-3.5 w-3.5 text-primary" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center gap-2">
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'system', icon: Monitor, label: 'System' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-lg border transition-all ${theme === t.id
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-secondary/10 border-border/50 text-muted-foreground hover:bg-secondary/20'
                    }`}
                >
                  <t.icon className="h-4 w-4 mb-1" />
                  <span className="text-[10px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badge Settings */}
        <BadgeSettings />

        {/* Help & Support */}
        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              Help & Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 p-3 pt-0">
            {[
              { label: 'FAQs', path: '/faq' },
              { label: 'Contact Support', path: '/support' },
              { label: 'Terms of Service', path: '/terms' },
              { label: 'Privacy Policy', path: '/privacy' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between p-2.5 bg-secondary/10 rounded-lg border border-border/50 hover:bg-secondary/20 transition-all text-left"
              >
                <span className="text-xs font-medium text-card-foreground">{item.label}</span>
                <RefreshCw className="h-3 w-3 text-muted-foreground rotate-90" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-primary" />
              App Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="p-2.5 bg-secondary/10 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-card-foreground">Version</p>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{currentVersion || '1.0.0'}</Badge>
              </div>
              <Button
                onClick={checkForUpdate}
                disabled={isChecking}
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs border-border/50"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Check Updates
                  </>
                )}
              </Button>
              {updateAvailable && (
                <Button
                  onClick={performImmediateUpdate}
                  className="w-full mt-2 h-8 text-xs bg-primary hover:bg-primary/90"
                >
                  Update Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full bg-secondary/10 border-border/50 text-foreground hover:bg-secondary/20 rounded-xl h-10 text-sm font-semibold mb-4"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        {/* Danger Zone */}
        <Card className="bg-destructive/5 border border-destructive/20 rounded-xl shadow-soft">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="p-2.5 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-[10px] text-destructive mb-3">
                Deleting your account is permanent. All your data, including music and earnings, will be wiped immediately.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => {
                  if (confirm("CRITICAL WARNING: Are you absolutely sure? This action cannot be undone.")) {
                    // In a real scenario, we'd Trigger a dedicated DeleteAccountDialog
                    // For now, we'll just show a toast that this feature is protected
                    // or mock the call if the edge function isn't ready.
                    const handleDeleteAccount = async () => {
                      try {
                        const { error } = await supabase.functions.invoke('delete-account');
                        if (error) throw error;

                        toast.success("Account deleted successfully");
                        await supabase.auth.signOut();
                        navigate('/');
                      } catch (error: any) {
                        console.error('Error deleting account:', error);
                        toast.error(error.message || "Failed to delete account. Please contact support.");
                      } finally {
                        // Assuming setIsDeleteOpen is a state setter for a dialog,
                        // if not, this line might need adjustment or removal.
                        // setIsDeleteOpen(false);
                      }
                    };
                    handleDeleteAccount();
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChangeEmailDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} />
      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />

      <TransactionPinDialog
        open={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onSuccess={async (pin) => {
          setPinLoading(true);
          const success = await setupPin(pin);
          if (success) {
            setShowPinDialog(false);
            refetchSecurity();

            // Log Security Activity
            try {
              await supabase.from('security_logs').insert({
                user_id: (await supabase.auth.getUser()).data.user?.id,
                event: 'pin_changed',
                details: { type: hasPin ? 'update' : 'setup' },
                ip_address: 'browser',
                user_agent: navigator.userAgent
              });
            } catch (logError) {
              console.error('Failed to log security activity:', logError);
            }
          }
          setPinLoading(false);
        }}
        loading={pinLoading}
        title={hasPin ? "Update Transaction PIN" : "Set Transaction PIN"}
        description={hasPin ? "Enter a new 4-digit PIN to update your security." : "Create a 4-digit PIN to secure your wallet actions."}
      />
    </div>
  );
};

export default Settings;