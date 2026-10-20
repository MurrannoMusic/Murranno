import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, LogOut, Calendar, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { PageTitle } from '@/components/layout/PagePrimitives';
import { TOOL_ITEMS } from '@/components/mobile/BottomNavigation';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
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
  // Changing an existing PIN is two steps: current PIN, then the new one.
  const [currentPin, setCurrentPin] = useState<string | null>(null);
  const askingCurrentPin = hasPin && currentPin === null;
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
    <div className="px-6 pb-10 space-y-6">
      <PageTitle>Settings</PageTitle>

      <Group title="Appearance">
        <div className="p-4 space-y-3">
          <div>
            <p className="text-base font-semibold">Choose your theme</p>
            <p className="text-sm text-muted-foreground">Your choice is saved on this device.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', icon: Sun, label: 'Light' },
              { id: 'dark', icon: Moon, label: 'Dark' },
              { id: 'system', icon: Monitor, label: 'System' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={theme === t.id}
                onClick={() => setTheme(t.id as 'light' | 'dark' | 'system')}
                className={`flex items-center justify-center gap-2 min-h-12 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${theme === t.id ? 'bg-primary/15 text-primary font-medium' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </Group>

      <Group title="Tools">
        {TOOL_ITEMS.map((t) => <Row key={t.path} label={t.label} to={t.path} />)}
      </Group>

      <Group title="Account">
        <Row label="Edit profile" to="/app/profile" />
        <Row label="Change email" onClick={() => setEmailDialogOpen(true)} />
        <Row label="Change password" onClick={() => setPasswordDialogOpen(true)} />
      </Group>

      <Group title="Subscription">
        {isSubLoading ? (
          <div className="p-4 grid place-items-center"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
        ) : activeSubscription ? (
          <div className="p-4 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-base font-semibold">{planDetails?.name || 'Current plan'}</p>
              <div className="flex gap-1.5">
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-success/10 text-success border-0">Active</Badge>
                {activeSubscription.isTrial && <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-warning/10 text-warning border-0">Trial</Badge>}
              </div>
              {activeSubscription.current_period_end && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Renews {new Date(activeSubscription.current_period_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
            <p className="text-right font-semibold tabular-nums">
              {formatCurrency(planDetails?.price_monthly || 0)}
              <span className="block text-[10px] font-normal text-muted-foreground">/ month</span>
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-1">
            <p className="text-base font-semibold">No active subscription</p>
            <p className="text-sm text-muted-foreground">Upgrade to unlock premium features</p>
          </div>
        )}
        <Row label="Plans and subscriptions" sub="Manage your access" to="/app/subscription/plans" />
      </Group>

      <Group title="Security">
        <Row
          label={hasPin ? 'Change transaction PIN' : 'Set transaction PIN'}
          sub="Required for withdrawals and bank account changes"
          onClick={() => setShowPinDialog(true)}
        />
        {biometricAvailable && (
          <ToggleRow
            label={`${biometricType} login`}
            sub="Use biometrics to log in"
            checked={biometricEnabled}
            onChange={(checked) => {
              setBiometricEnabled(checked);
              localStorage.setItem('biometric_enabled', String(checked));
              toast.success(checked ? 'Biometric enabled' : 'Biometric disabled');
            }}
          />
        )}
        <Row label={showSecurityLogs ? 'Hide recent security activity' : 'Recent security activity'} onClick={() => setShowSecurityLogs(!showSecurityLogs)} />
        {showSecurityLogs && <div className="p-4"><SecurityActivityLog /></div>}
      </Group>

      <Group title="Notifications">
        {isLoading ? (
          <div className="p-4 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : (
          [
            { id: 'email_notifications', label: 'Email notifications', sub: 'Receive updates via email' },
            { id: 'push_notifications', label: 'Push notifications', sub: 'Get real-time alerts' },
            { id: 'in_app_notifications', label: 'In-app notifications', sub: 'Show alerts in the app' },
            { id: 'release_updates', label: 'Release updates', sub: 'Track status changes' },
            { id: 'campaign_updates', label: 'Campaign updates', sub: 'Promotion updates' },
            { id: 'earnings_alerts', label: 'Earnings alerts', sub: 'Payment notifications' },
            { id: 'marketing_emails', label: 'Marketing emails', sub: 'Product offers' },
          ].map((item) => (
            <ToggleRow
              key={item.id}
              label={item.label}
              sub={item.sub}
              checked={!!preferences?.[item.id as keyof typeof preferences]}
              onChange={(checked) => updatePreference(item.id as any, checked)}
            />
          ))
        )}
      </Group>

      <BadgeSettings />

      <Group title="Help and support">
        <Row label="FAQs" to="/faq" />
        <Row label="Contact support" to="/support" />
        <Row label="Terms of service" to="/terms" />
        <Row label="Privacy policy" to="/privacy" />
      </Group>

      <Group title="App">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-base">Version</p>
            <span className="text-sm text-muted-foreground tabular-nums">{currentVersion || '1.0.0'}</span>
          </div>
          <Button onClick={checkForUpdate} disabled={isChecking} variant="outline" className="w-full">
            {isChecking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking…</> : 'Check for updates'}
          </Button>
          {updateAvailable && <Button onClick={performImmediateUpdate} className="w-full">Update now</Button>}
        </div>
      </Group>

      <Button onClick={handleSignOut} variant="outline" className="w-full min-h-12 text-base font-semibold">
        <LogOut className="h-4 w-4 mr-2" /> Sign out
      </Button>

      <Group title="Danger zone">
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">Deleting your account is permanent. Your music, earnings history and profile are removed.</p>
          <Button
            variant="destructive"
            className="w-full"
            onClick={async () => {
              if (!confirm('Delete your account? This cannot be undone.')) return;
              try {
                const { error } = await supabase.functions.invoke('delete-account');
                if (error) throw error;
                toast.success('Account deleted');
                await supabase.auth.signOut();
                navigate('/');
              } catch (error: any) {
                console.error('Error deleting account:', error);
                toast.error(error.message || 'Failed to delete account. Please contact support.');
              }
            }}
          >
            Delete account
          </Button>
        </div>
      </Group>

      <ChangeEmailDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} />
      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />

      <TransactionPinDialog
        open={showPinDialog}
        onClose={() => { setShowPinDialog(false); setCurrentPin(null); }}
        onSuccess={async (pin) => {
          if (askingCurrentPin) {
            setCurrentPin(pin);
            return;
          }
          setPinLoading(true);
          const success = await setupPin(pin, currentPin ?? undefined);
          setCurrentPin(null);
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
        title={askingCurrentPin ? "Enter Current PIN" : hasPin ? "Update Transaction PIN" : "Set Transaction PIN"}
        description={askingCurrentPin ? "Confirm it's you with your current 4-digit PIN." : hasPin ? "Enter a new 4-digit PIN to update your security." : "Create a 4-digit PIN to secure your wallet actions."}
      />
    </div>
  );
};

// Grouped list, same as the Expo Settings screen.
const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
    <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">{children}</div>
  </section>
);

const rowClass = 'w-full flex items-center gap-3 px-4 min-h-14 py-3 text-left transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:bg-secondary/50';

const Row = ({ label, sub, to, onClick }: { label: string; sub?: string; to?: string; onClick?: () => void }) => {
  const body = (
    <>
      <span className="flex-1 min-w-0">
        <span className="block text-base">{label}</span>
        {sub && <span className="block text-xs text-muted-foreground">{sub}</span>}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </>
  );
  return to ? <Link to={to} className={rowClass}>{body}</Link> : <button type="button" onClick={onClick} className={rowClass}>{body}</button>;
};

const ToggleRow = ({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-center gap-3 px-4 min-h-14 py-3 cursor-pointer">
    <span className="flex-1 min-w-0">
      <span className="block text-base">{label}</span>
      {sub && <span className="block text-xs text-muted-foreground">{sub}</span>}
    </span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </label>
);

export default Settings;