import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { gradients } from '../theme/gradients';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAppNavigation } from '../hooks/useAppNavigation';

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigateTo } = useAppNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [appleMusicUrl, setAppleMusicUrl] = useState('');

  // Mock user data - replace with actual hook
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    accountType: 'artist',
    avatar: null,
    spotifyUrl: '',
    appleMusicUrl: '',
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleSaveLinks = () => {
    // Save links logic here
    setIsEditingLinks(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.mesh.colors as any}
        locations={gradients.mesh.locations}
        start={gradients.mesh.start}
        end={gradients.mesh.end}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Bar */}
      <BlurView intensity={80} tint="dark" style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.topBarContent}>
          <TouchableOpacity>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>MM</Text>
            </View>
          </TouchableOpacity>

          <Badge variant="default" style={styles.userTypeBadge}>
            PROFILE
          </Badge>

          <TouchableOpacity onPress={() => navigateTo.settings()} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 70, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Profile Info Card */}
        <Card style={styles.profileCard}>
          <CardHeader>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="person" size={20} color={colors.primary} />
              <CardTitle>Profile Information</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <View style={styles.profileInfo}>
              <TouchableOpacity style={styles.avatarContainer}>
                <Avatar
                  src={user.avatar}
                  fallback={user.name.substring(0, 2).toUpperCase()}
                  size="xl"
                />
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="camera" size={12} color={colors.primaryForeground} />
                </View>
              </TouchableOpacity>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userType}>{user.accountType.toUpperCase()}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Streaming Links Card */}
        <Card style={styles.linksCard}>
          <CardHeader>
            <View style={styles.cardHeaderRowSpaced}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="musical-notes" size={20} color={colors.primary} />
                <CardTitle>Streaming Links</CardTitle>
              </View>
              {!isEditingLinks && (spotifyUrl || appleMusicUrl) && (
                <TouchableOpacity onPress={() => setIsEditingLinks(true)}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </CardHeader>
          <CardContent>
            {!isEditingLinks && !spotifyUrl && !appleMusicUrl ? (
              <View style={styles.emptyLinks}>
                <Text style={styles.emptyLinksText}>Connect your streaming profiles</Text>
                <Button
                  variant="outline"
                  onPress={() => setIsEditingLinks(true)}
                  style={styles.addLinksButton}
                >
                  Add Streaming Links
                </Button>
              </View>
            ) : isEditingLinks ? (
              <View style={styles.editLinksForm}>
                <Input
                  label="Spotify Profile Link"
                  placeholder="https://open.spotify.com/artist/..."
                  value={spotifyUrl}
                  onChangeText={setSpotifyUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                
                <Input
                  label="Apple Music Profile Link"
                  placeholder="https://music.apple.com/..."
                  value={appleMusicUrl}
                  onChangeText={setAppleMusicUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />

                <View style={styles.editLinksActions}>
                  <Button
                    variant="default"
                    onPress={handleSaveLinks}
                    style={styles.saveButton}
                  >
                    <Ionicons name="checkmark" size={18} color={colors.primaryForeground} />
                    <Text style={styles.saveButtonText}>Save Links</Text>
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => setIsEditingLinks(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                </View>
              </View>
            ) : (
              <View style={styles.linksList}>
                {spotifyUrl && (
                  <View style={styles.linkItem}>
                    <Text style={styles.linkLabel}>Spotify</Text>
                    <Text style={styles.linkUrl} numberOfLines={1}>{spotifyUrl}</Text>
                  </View>
                )}
                {appleMusicUrl && (
                  <View style={styles.linkItem}>
                    <Text style={styles.linkLabel}>Apple Music</Text>
                    <Text style={styles.linkUrl} numberOfLines={1}>{appleMusicUrl}</Text>
                  </View>
                )}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <CardContent>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigateTo.artistProfile()}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="person-circle" size={24} color={colors.primary} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Artist Profile</Text>
                <Text style={styles.actionDescription}>Manage your public artist profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigateTo.subscriptionPlans()}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="star" size={24} color={colors.primary} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Subscription</Text>
                <Text style={styles.actionDescription}>View and manage your plan</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigateTo.settings()}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="settings" size={24} color={colors.primary} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Settings</Text>
                <Text style={styles.actionDescription}>Account and app preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    color: colors.primaryForeground,
  },
  userTypeBadge: {
    backgroundColor: `${colors.primary}15`,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
  },
  profileCard: {
    marginBottom: spacing[4],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  cardHeaderRowSpaced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: `${colors.secondary}20`,
    borderRadius: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },
  userName: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
  userType: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  userEmail: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  linksCard: {
    marginBottom: spacing[4],
  },
  emptyLinks: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  emptyLinksText: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
    marginBottom: spacing[4],
  },
  addLinksButton: {
    minWidth: 180,
  },
  editLinksForm: {
    gap: spacing[4],
  },
  editLinksActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  saveButtonText: {
    color: colors.primaryForeground,
    fontFamily: typography.fontFamily.medium,
  },
  cancelButton: {
    flex: 1,
  },
  linksList: {
    gap: spacing[3],
  },
  linkItem: {
    padding: spacing[3],
    backgroundColor: `${colors.secondary}20`,
    borderRadius: 12,
  },
  linkLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedForeground,
    marginBottom: spacing[1],
  },
  linkUrl: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
  },
  actionsCard: {
    marginBottom: spacing[4],
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  actionTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.foreground,
  },
  actionDescription: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  actionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[1],
  },
});

export default ProfileScreen;
