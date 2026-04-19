/**
 * SettingsScreen - React Native
 * Matches src/pages/Settings.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { colors } from '../theme/colors';
import { gradients } from '../theme/gradients';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

type ThemeMode = 'light' | 'dark' | 'system';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  release_updates: boolean;
  campaign_updates: boolean;
  earnings_alerts: boolean;
  marketing_emails: boolean;
}

const SettingsScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const { signOut } = useAuth();
  const { showToast } = useToast();

  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    in_app_notifications: true,
    release_updates: true,
    campaign_updates: true,
    earnings_alerts: true,
    marketing_emails: false,
  });
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast('Signed out successfully', 'success');
      navigation.navigate('Login');
    } catch (error) {
      showToast('Failed to sign out', 'error');
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    // TODO: Sync with backend
  };

  const ThemeButton: React.FC<{
    mode: ThemeMode;
    icon: string;
    label: string;
  }> = ({ mode, icon, label }) => (
    <TouchableOpacity
      style={[
        styles.themeButton,
        theme === mode && styles.themeButtonActive,
      ]}
      onPress={() => setTheme(mode)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={theme === mode ? colors.white : colors.cardForeground}
      />
      <Text
        style={[
          styles.themeButtonText,
          theme === mode && styles.themeButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SettingRow: React.FC<{
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }> = ({ title, subtitle, value, onValueChange }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );

  const ActionButton: React.FC<{
    icon: string;
    label: string;
    onPress: () => void;
    showBadge?: boolean;
  }> = ({ icon, label, onPress, showBadge }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
      <Text style={styles.actionButtonText}>{label}</Text>
      {showBadge && <Badge variant="secondary">Active</Badge>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={gradients.dark.colors}
        style={styles.header}
      >
        <BlurView intensity={20} tint="dark" style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/mm_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Badge variant="primary">SETTINGS</Badge>
          <TouchableOpacity style={styles.avatarButton}>
            <Ionicons name="person-circle" size={32} color={colors.primary} />
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Settings */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="moon" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Theme</Text>
          </View>
          <View style={styles.themeContainer}>
            <ThemeButton mode="light" icon="sunny" label="Light Mode" />
            <ThemeButton mode="dark" icon="moon" label="Dark Mode" />
            <ThemeButton mode="system" icon="phone-portrait" label="System Default" />
          </View>
        </Card>

        {/* Notifications */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Notifications</Text>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.settingsContainer}>
              <SettingRow
                title="Email Notifications"
                subtitle="Receive updates via email"
                value={preferences.email_notifications}
                onValueChange={(v) => updatePreference('email_notifications', v)}
              />
              <SettingRow
                title="Push Notifications"
                subtitle="Get real-time alerts on your device"
                value={preferences.push_notifications}
                onValueChange={(v) => updatePreference('push_notifications', v)}
              />
              <SettingRow
                title="In-App Notifications"
                subtitle="Show notifications in the app"
                value={preferences.in_app_notifications}
                onValueChange={(v) => updatePreference('in_app_notifications', v)}
              />
              <SettingRow
                title="Release Updates"
                subtitle="Track status changes"
                value={preferences.release_updates}
                onValueChange={(v) => updatePreference('release_updates', v)}
              />
              <SettingRow
                title="Campaign Updates"
                subtitle="Promotion campaign notifications"
                value={preferences.campaign_updates}
                onValueChange={(v) => updatePreference('campaign_updates', v)}
              />
              <SettingRow
                title="Earnings Alerts"
                subtitle="Payment notifications"
                value={preferences.earnings_alerts}
                onValueChange={(v) => updatePreference('earnings_alerts', v)}
              />
              <SettingRow
                title="Marketing Emails"
                subtitle="Product updates and offers"
                value={preferences.marketing_emails}
                onValueChange={(v) => updatePreference('marketing_emails', v)}
              />
            </View>
          )}
        </Card>

        {/* Security */}
        {biometricAvailable && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="finger-print" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Security</Text>
            </View>
            <View style={styles.settingsContainer}>
              <SettingRow
                title="Biometric Login"
                subtitle="Use biometrics to log in quickly"
                value={biometricEnabled}
                onValueChange={(v) => {
                  setBiometricEnabled(v);
                  showToast(
                    v ? 'Biometric login enabled' : 'Biometric login disabled',
                    'success'
                  );
                }}
              />
            </View>
          </Card>
        )}

        {/* Account */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Account</Text>
          </View>
          <View style={styles.actionsContainer}>
            <ActionButton
              icon="person"
              label="Edit Profile"
              onPress={() => navigation.navigate('Profile')}
            />
            <ActionButton
              icon="mail"
              label="Change Email"
              onPress={() => {}}
            />
            <ActionButton
              icon="lock-closed"
              label="Change Password"
              onPress={() => {}}
            />
          </View>
        </Card>

        {/* Subscription */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Subscription</Text>
          </View>
          <ActionButton
            icon="settings"
            label="Manage Subscription"
            onPress={() => navigation.navigate('SubscriptionPlans')}
            showBadge
          />
        </Card>

        {/* Help & Support */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="help-circle" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Help & Support</Text>
          </View>
          <View style={styles.actionsContainer}>
            <ActionButton icon="help" label="FAQs" onPress={() => {}} />
            <ActionButton icon="chatbubble" label="Contact Support" onPress={() => {}} />
            <ActionButton icon="document-text" label="Terms of Service" onPress={() => {}} />
            <ActionButton icon="shield-checkmark" label="Privacy Policy" onPress={() => {}} />
          </View>
        </Card>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={20} color={colors.destructive} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    height: 32,
    width: 100,
  },
  avatarButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.cardForeground,
  },
  themeContainer: {
    gap: 12,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  themeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.cardForeground,
  },
  themeButtonTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  settingsContainer: {
    gap: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.cardForeground,
  },
  settingSubtitle: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  actionsContainer: {
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.cardForeground,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.destructive,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.destructive,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default SettingsScreen;
