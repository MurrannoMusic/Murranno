import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';
import { LinearGradient } from 'expo-linear-gradient';

interface Track {
  id: string;
  title: string;
  duration: string;
  streams: number;
  isrc?: string;
}

interface ReleaseDetailScreenProps {
  navigation: any;
  route: {
    params: {
      releaseId: string;
      title: string;
      artist: string;
      coverArt: string;
      releaseDate: string;
      status: string;
      genre: string;
      tracks: Track[];
    };
  };
}

const ReleaseDetailScreen: React.FC<ReleaseDetailScreenProps> = ({ navigation, route }) => {
  const {
    title = 'Album Title',
    artist = 'Artist Name',
    coverArt = 'https://via.placeholder.com/300',
    releaseDate = '2024-01-15',
    status = 'released',
    genre = 'Afrobeats',
    tracks = [],
  } = route?.params || {};

  const mockTracks: Track[] = tracks.length > 0 ? tracks : [
    { id: '1', title: 'Track One', duration: '3:24', streams: 125000, isrc: 'NGXXX2400001' },
    { id: '2', title: 'Track Two', duration: '4:12', streams: 89000, isrc: 'NGXXX2400002' },
    { id: '3', title: 'Track Three', duration: '3:45', streams: 67000, isrc: 'NGXXX2400003' },
  ];

  const totalStreams = mockTracks.reduce((sum, track) => sum + track.streams, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'released': return colors.success;
      case 'pending': return colors.warning;
      case 'draft': return colors.muted;
      default: return colors.muted;
    }
  };

  const renderTrackItem = ({ item, index }: { item: Track; index: number }) => (
    <TouchableOpacity style={styles.trackItem}>
      <View style={styles.trackNumber}>
        <Text style={styles.trackNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{item.title}</Text>
        <Text style={styles.trackMeta}>{item.duration} • {item.isrc}</Text>
      </View>
      <View style={styles.trackStreams}>
        <Ionicons name="play-circle" size={16} color={colors.primary} />
        <Text style={styles.streamsText}>{formatNumber(item.streams)}</Text>
      </View>
      <TouchableOpacity style={styles.trackMenu}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Cover Art Section */}
        <View style={styles.coverSection}>
          <Image source={{ uri: coverArt }} style={styles.coverArt} />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.coverGradient}
          />
        </View>

        {/* Release Info */}
        <View style={styles.releaseInfo}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
          <Text style={styles.releaseTitle}>{title}</Text>
          <Text style={styles.releaseArtist}>{artist}</Text>
          <View style={styles.releaseMeta}>
            <Text style={styles.metaText}>{genre}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{releaseDate}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{mockTracks.length} tracks</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="play-circle" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{formatNumber(totalStreams)}</Text>
            <Text style={styles.statLabel}>Total Streams</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="musical-notes" size={24} color={colors.secondary} />
            <Text style={styles.statValue}>{mockTracks.length}</Text>
            <Text style={styles.statLabel}>Tracks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="globe" size={24} color={colors.accent} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Platforms</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="megaphone" size={20} color={colors.primaryForeground} />
            <Text style={styles.primaryButtonText}>Promote</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="share-social" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="link" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Smart Link</Text>
          </TouchableOpacity>
        </View>

        {/* Tracks Section */}
        <View style={styles.tracksSection}>
          <Text style={styles.sectionTitle}>Tracks</Text>
          <FlatList
            data={mockTracks}
            renderItem={renderTrackItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Streaming Platforms */}
        <View style={styles.platformsSection}>
          <Text style={styles.sectionTitle}>Available On</Text>
          <View style={styles.platformsGrid}>
            {['Spotify', 'Apple Music', 'YouTube Music', 'Deezer', 'Tidal', 'Audiomack'].map((platform) => (
              <TouchableOpacity key={platform} style={styles.platformItem}>
                <View style={styles.platformIcon}>
                  <Ionicons name="musical-note" size={20} color={colors.primary} />
                </View>
                <Text style={styles.platformName}>{platform}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background + '80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background + '80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverSection: {
    height: 320,
    position: 'relative',
  },
  coverArt: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  releaseInfo: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  releaseTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  releaseArtist: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  releaseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  metaDot: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginHorizontal: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 16,
    ...shadows.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  primaryButtonText: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  tracksSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  trackNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  trackNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  trackMeta: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  trackStreams: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  streamsText: {
    fontSize: 13,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  trackMenu: {
    padding: spacing.xs,
  },
  platformsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  platformIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  platformName: {
    fontSize: 13,
    color: colors.foreground,
    fontWeight: '500',
  },
});

export default ReleaseDetailScreen;
