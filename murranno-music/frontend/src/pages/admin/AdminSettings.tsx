import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Settings,
  Shield,
  CreditCard,
  Bell,
  Database,
  HelpCircle,
  Scale,
  Globe,
  Share2,
  Save,
  Users,
  AlertTriangle,
  Server
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminTeamSettings } from '@/components/admin/settings/AdminTeamSettings';

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  autoApproveUploads: boolean;
  contentModerationEnabled: boolean;
  maintenanceMode: boolean; // Added
  restrictedWords: string[];
  maxUploadsPerMonth: number;
  maxFileSize: number;
  paymentProcessor: string;
  minimumPayout: number;
  payoutSchedule: string;
  platformFee: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  helpCenterUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  termsUrl?: string;
  privacyUrl?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialFacebook?: string;
  socialLinkedin?: string;
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'Murranno Music',
    supportEmail: 'support@murranno.com',
    autoApproveUploads: false,
    contentModerationEnabled: true,
    maintenanceMode: false, // Added
    restrictedWords: [],
    maxUploadsPerMonth: 10,
    maxFileSize: 200,
    paymentProcessor: 'paystack',
    minimumPayout: 5000,
    payoutSchedule: 'monthly',
    platformFee: 15,
    emailNotifications: true,
    smsNotifications: false,
    helpCenterUrl: '',
    contactPhone: '',
    contactEmail: '',
    termsUrl: '',
    privacyUrl: '',
    socialInstagram: '',
    socialTwitter: '',
    socialFacebook: '',
    socialLinkedin: '',
  });

  // Fetch current settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-platform-settings');
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch settings');
      return data.settings;
    },
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (settingsData) {
      setSettings({
        platformName: settingsData.platform_name,
        supportEmail: settingsData.support_email,
        autoApproveUploads: settingsData.auto_approve_uploads,
        contentModerationEnabled: settingsData.content_moderation_enabled,
        maintenanceMode: settingsData.maintenance_mode || false, // Added
        restrictedWords: settingsData.restricted_words || [],
        maxUploadsPerMonth: settingsData.max_uploads_per_month,
        maxFileSize: settingsData.max_file_size_mb,
        paymentProcessor: settingsData.payment_processor,
        minimumPayout: Number(settingsData.minimum_payout_amount),
        payoutSchedule: settingsData.payout_schedule,
        platformFee: Number(settingsData.platform_fee_percentage),
        emailNotifications: settingsData.email_notifications_enabled,
        smsNotifications: settingsData.sms_notifications_enabled,
        helpCenterUrl: settingsData.help_center_url,
        contactPhone: settingsData.contact_phone,
        contactEmail: settingsData.contact_email,
        termsUrl: settingsData.terms_url,
        privacyUrl: settingsData.privacy_url,
        socialInstagram: settingsData.social_instagram,
        socialTwitter: settingsData.social_twitter,
        socialFacebook: settingsData.social_facebook,
        socialLinkedin: settingsData.social_linkedin,
      });
    }
  }, [settingsData]);

  const saveSettings = useMutation({
    mutationFn: async (newSettings: PlatformSettings) => {
      const { data, error } = await supabase.functions.invoke('update-platform-settings', {
        body: { settings: newSettings }
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to save settings');
      return data.settings;
    },
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save settings');
    },
  });

  const seedServices = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('seed-promotion-services');
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to seed services');
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Promotional services seeded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to seed promotional services');
    },
  });

  const handleSave = () => {
    saveSettings.mutate(settings);
  };

  const handleSeedServices = () => {
    if (confirm('This will seed promotional services and bundles. Continue?')) {
      seedServices.mutate();
    }
  };

  const updateSetting = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Platform Settings</h2>
            <p className="text-muted-foreground">Manage platform configuration and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={saveSettings.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {saveSettings.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2">
              <Mail className="h-4 w-4" />
              Support
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-2">
              <Shield className="h-4 w-4" />
              Legal
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Globe className="h-4 w-4" />
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Platform Information
                </CardTitle>
                <CardDescription>
                  Basic platform settings and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input
                    id="platform-name"
                    value={settings.platformName}
                    onChange={(e) => updateSetting('platformName', e.target.value)}
                    placeholder="Enter platform name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting('supportEmail', e.target.value)}
                    placeholder="support@example.com"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 border-destructive/20 bg-destructive/5">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode" className="text-destructive font-semibold">Maintenance Mode</Label>
                    <p className="text-sm text-destructive/80">
                      When enabled, only admins can access the platform.
                    </p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-upload">Max Upload Size (MB)</Label>
                  <Input
                    id="max-upload"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum file size for audio uploads
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-uploads">Max Uploads per Month</Label>
                  <Input
                    id="max-uploads"
                    type="number"
                    value={settings.maxUploadsPerMonth}
                    onChange={(e) => updateSetting('maxUploadsPerMonth', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum number of uploads allowed per artist per month
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <AdminTeamSettings />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Content Moderation
                </CardTitle>
                <CardDescription>
                  Configure content review and moderation settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-approve">Auto-Approve Releases</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically approve new releases without manual review
                    </p>
                  </div>
                  <Switch
                    id="auto-approve"
                    checked={settings.autoApproveUploads}
                    onCheckedChange={(checked) => updateSetting('autoApproveUploads', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="moderation">Content Moderation</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automated content moderation checks
                    </p>
                  </div>
                  <Switch
                    id="moderation"
                    checked={settings.contentModerationEnabled}
                    onCheckedChange={(checked) => updateSetting('contentModerationEnabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restricted-words">Restricted Words</Label>
                  <Textarea
                    id="restricted-words"
                    placeholder="Enter restricted words (one per line)"
                    rows={5}
                    className="resize-none"
                    value={settings.restrictedWords.join('\n')}
                    onChange={(e) => updateSetting('restrictedWords', e.target.value.split('\n').filter(Boolean))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Content containing these words will be flagged for review
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Configuration
                </CardTitle>
                <CardDescription>
                  Manage payment processing and payout settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="gateway">Payment Gateway</Label>
                  <Select
                    value={settings.paymentProcessor}
                    onValueChange={(value) => updateSetting('paymentProcessor', value)}
                  >
                    <SelectTrigger id="gateway">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paystack">Paystack</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="flutterwave">Flutterwave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission">Platform Fee (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.platformFee}
                    onChange={(e) => updateSetting('platformFee', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Percentage taken from artist earnings
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-payout">Minimum Payout Amount</Label>
                  <Input
                    id="min-payout"
                    type="number"
                    value={settings.minimumPayout}
                    onChange={(e) => updateSetting('minimumPayout', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum balance required for withdrawal
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payout-schedule">Payout Schedule</Label>
                  <Select
                    value={settings.payoutSchedule}
                    onValueChange={(value) => updateSetting('payoutSchedule', value)}
                  >
                    <SelectTrigger id="payout-schedule">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notif">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications for important events
                    </p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notif">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send SMS notifications for critical events
                    </p>
                  </div>
                  <Switch
                    id="sms-notif"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Promotional Services Data
                </CardTitle>
                <CardDescription>
                  Manage promotional services and bundle data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Seed Promotional Services</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will populate the database with 27 promotional services across 7 categories and 4 promotional bundles (Starter, Growth, Momentum, and Supernova Junkets).
                    </p>
                    <Button
                      onClick={handleSeedServices}
                      disabled={seedServices.isPending}
                      variant="outline"
                      className="gap-2"
                    >
                      <Database className="h-4 w-4" />
                      {seedServices.isPending ? 'Seeding...' : 'Seed Services & Bundles'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="support" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Support Configuration
                </CardTitle>
                <CardDescription>
                  Manage support contact information and links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="help-center">Help Center URL</Label>
                  <Input
                    id="help-center"
                    placeholder="https://help.murranno.com"
                    value={settings.helpCenterUrl || ''}
                    onChange={(e) => updateSetting('helpCenterUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input
                    id="contact-phone"
                    placeholder="+234..."
                    value={settings.contactPhone || ''}
                    onChange={(e) => updateSetting('contactPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="contact@murranno.com"
                    value={settings.contactEmail || ''}
                    onChange={(e) => updateSetting('contactEmail', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Legal Documents
                </CardTitle>
                <CardDescription>
                  Links to legal documents and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="terms-url">Terms of Service URL</Label>
                  <Input
                    id="terms-url"
                    placeholder="https://murranno.com/terms"
                    value={settings.termsUrl || ''}
                    onChange={(e) => updateSetting('termsUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="privacy-url">Privacy Policy URL</Label>
                  <Input
                    id="privacy-url"
                    placeholder="https://murranno.com/privacy"
                    value={settings.privacyUrl || ''}
                    onChange={(e) => updateSetting('privacyUrl', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media Links
                </CardTitle>
                <CardDescription>
                  Manage platform social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="social-instagram">Instagram URL</Label>
                  <Input
                    id="social-instagram"
                    placeholder="https://instagram.com/murrannomusic"
                    value={settings.socialInstagram || ''}
                    onChange={(e) => updateSetting('socialInstagram', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-twitter">Twitter/X URL</Label>
                  <Input
                    id="social-twitter"
                    placeholder="https://twitter.com/murrannomusic"
                    value={settings.socialTwitter || ''}
                    onChange={(e) => updateSetting('socialTwitter', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-facebook">Facebook URL</Label>
                  <Input
                    id="social-facebook"
                    placeholder="https://facebook.com/murrannomusic"
                    value={settings.socialFacebook || ''}
                    onChange={(e) => updateSetting('socialFacebook', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-linkedin">LinkedIn URL</Label>
                  <Input
                    id="social-linkedin"
                    placeholder="https://linkedin.com/company/murranno-music"
                    value={settings.socialLinkedin || ''}
                    onChange={(e) => updateSetting('socialLinkedin', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
