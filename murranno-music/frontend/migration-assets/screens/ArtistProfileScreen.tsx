import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { LinearGradient } from 'expo-linear-gradient';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  color: string;
}

const ArtistProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [artistData, setArtistData] = useState({
    stageName: 'Burna Boy',
    bio: 'Grammy Award-winning Nigerian Afro-fusion artist. Known for hits like "Ye", "On The Low", and "Last Last".',
    profileImage: 'https://via.placeholder.com/150',
    verified: true,
    followers: 12500000,
    monthlyListeners: 8200000,
  });

  const socialLinks: SocialLink[] = [
    { platform: 'Spotify', url: 'https://spotify.com/artist/...', icon: 'musical-notes', color: '#1DB954' },
    { platform: 'Apple Music', url: 'https://music.apple.com/...', icon: 'logo-apple', color: '#FC3C44' },
    { platform: 'Instagram', url: 'https://instagram.com/...', icon: 'logo-instagram', color: '#E4405F' },
    { platform: 'Twitter', url: 'https://twitter.com/...', icon: 'logo-twitter', color: '#1DA1F2' },
    { platform: 'TikTok', url: 'https://tiktok.com/...', icon: 'logo-tiktok', color: '#000000' },
    { platform: 'YouTube', url: 'https://youtube.com/...', icon: 'logo-youtube', color: '#FF0000' },
  ];

  const stats = [
    { label: 'Releases', value: 24 },
    { label: 'Tracks', value: 156 },
    { label: 'Playlists', value: 89 },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Artist Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons 
              name={isEditing ? 'checkmark' : 'create-outline'} 
              size={24} 
              color={isEditing ? colors.success : colors.foreground} 
            />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[colors.primary + '40', colors.secondary + '40']}
            style={styles.coverGradient}
          />
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: artistData.profileImage }} style={styles.profileImage} />
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoButton}>
                <Ionicons name="camera" size={20} color={colors.primaryForeground} />
              </TouchableOpacity>
            )}
            {artistData.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              </View>
            )}
          </View>

          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={artistData.stageName}
              onChangeText={(text) => setArtistData({ ...artistData, stageName: text })}
              placeholder="Stage Name"
              placeholderTextColor={colors.mutedForeground}
            />
          ) : (
            <Text style={styles.stageName}>{artistData.stageName}</Text>
          )}

          <View style={styles.listenerStats}>
            <View style={styles.listenerStat}>
              <Text style={styles.listenerValue}>{formatNumber(artistData.followers)}</Text>
              <Text style={styles.listenerLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.listenerStat}>
              <Text style={styles.listenerValue}>{formatNumber(artistData.monthlyListeners)}</Text>
              <Text style={styles.listenerLabel}>Monthly Listeners</Text>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          {isEditing ? (
            <TextInput
              style={styles.bioInput}
              value={artistData.bio}
              onChangeText={(text) => setArtistData({ ...artistData, bio: text })}
              placeholder="Tell your story..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
            />
          ) : (
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{artistData.bio}</Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Streaming & Social Links</Text>
            {isEditing && (
              <TouchableOpacity>
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.socialLinksGrid}>
            {socialLinks.map((link) => (
              <TouchableOpacity key={link.platform} style={styles.socialLinkCard}>
                <View style={[styles.socialIcon, { backgroundColor: link.color + '20' }]}>
                  <Ionicons name={link.icon as any} size={24} color={link.color} />
                </View>
                <Text style={styles.socialPlatform}>{link.platform}</Text>
                <View style={styles.socialStatus}>
                  <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.statusText}>Connected</Text>
                </View>
                {isEditing && (
                  <TouchableOpacity style={styles.editLinkButton}>
                    <Ionicons name="pencil" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Profile Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="globe-outline" size={22} color={colors.primary} />
                <Text style={styles.settingLabel}>Public Profile</Text>
              </View>
              <Switch
                value={true}
                trackColor={{ false: colors.muted, true: colors.primary + '50' }}
                thumbColor={colors.primary}
              />
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="share-social-outline" size={22} color={colors.primary} />
                <Text style={styles.settingLabel}>Show Social Stats</Text>
              </View>
              <Switch
                value={true}
                trackColor={{ false: colors.muted, true: colors.primary + '50' }}
                thumbColor={colors.primary}
              />
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={22} color={colors.primary} />
                <Text style={styles.settingLabel}>Follower Notifications</Text>
              </View>
              <Switch
                value={false}
                trackColor={{ false: colors.muted, true: colors.primary + '50' }}
                thumbColor={colors.muted}
              />
            </View>
          </View>
        </View>

        {/* Smart Link Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Link</Text>
          <TouchableOpacity style={styles.smartLinkCard}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.smartLinkGradient}
            >
              <Ionicons name="link" size={24} color={colors.primaryForeground} />
              <View style={styles.smartLinkInfo}>
                <Text style={styles.smartLinkTitle}>Your Smart Link</Text>
                <Text style={styles.smartLinkUrl}>murranno.link/burnaboy</Text>
              </View>
              <Ionicons name="copy-outline" size={22} color={colors.primaryForeground} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.destructive }]}>Danger Zone</Text>
            <TouchableOpacity style={styles.dangerButton}>
              <Ionicons name="trash-outline" size={20} color={colors.destructive} />
              <Text style={styles.dangerButtonText}>Delete Artist Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  profileImageContainer: {
    position: 'relative',
    marginTop: spacing.xl,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.background,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  stageName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: spacing.md,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: spacing.md,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  listenerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  listenerStat: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  listenerValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  listenerLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  bioCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.sm,
  },
  bioText: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 22,
  },
  bioInput: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    fontSize: 14,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
  },
  statLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  socialLinksGrid: {
    gap: spacing.sm,
  },
  socialLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  socialPlatform: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  socialStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.success,
  },
  editLinkButton: {
    padding: spacing.xs,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.foreground,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  smartLinkCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  smartLinkGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  smartLinkInfo: {
    flex: 1,
  },
  smartLinkTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  smartLinkUrl: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.destructive + '15',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.destructive + '30',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.destructive,
  },
});

export default ArtistProfileScreen;
