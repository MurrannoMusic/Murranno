import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { gradients } from '../theme/gradients';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { useAppNavigation } from '../hooks/useAppNavigation';

interface Release {
  id: string;
  title: string;
  artist: string;
  coverArt: string | null;
  releaseDate: string;
  status: 'draft' | 'pending' | 'approved' | 'live';
  type: 'single' | 'ep' | 'album';
  streams: number;
}

const ReleasesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigateTo } = useAppNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Mock data - replace with actual hook
  const releases: Release[] = [
    {
      id: '1',
      title: 'Midnight Vibes',
      artist: 'John Doe',
      coverArt: null,
      releaseDate: '2025-01-15',
      status: 'live',
      type: 'single',
      streams: 15234,
    },
    {
      id: '2',
      title: 'Summer Heat EP',
      artist: 'John Doe',
      coverArt: null,
      releaseDate: '2024-12-01',
      status: 'live',
      type: 'ep',
      streams: 45678,
    },
    {
      id: '3',
      title: 'New Track',
      artist: 'John Doe',
      coverArt: null,
      releaseDate: '2025-02-01',
      status: 'pending',
      type: 'single',
      streams: 0,
    },
  ];

  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'live', label: 'Live' },
    { value: 'pending', label: 'Pending' },
    { value: 'draft', label: 'Drafts' },
  ];

  const filteredReleases = activeTab === 'all' 
    ? releases 
    : releases.filter(r => r.status === activeTab);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'success';
      case 'pending':
        return 'warning';
      case 'draft':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatStreams = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderReleaseItem = ({ item }: { item: Release }) => (
    <TouchableOpacity
      onPress={() => navigateTo.releaseDetail(item.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.releaseCard}>
        <CardContent style={styles.releaseContent}>
          <View style={styles.coverArt}>
            {item.coverArt ? (
              <Image source={{ uri: item.coverArt }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="musical-notes" size={24} color={colors.mutedForeground} />
              </View>
            )}
          </View>
          
          <View style={styles.releaseInfo}>
            <Text style={styles.releaseTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.releaseArtist}>{item.artist}</Text>
            <View style={styles.releaseMeta}>
              <Badge variant={getStatusColor(item.status) as any} style={styles.statusBadge}>
                {item.status.toUpperCase()}
              </Badge>
              <Text style={styles.releaseType}>{item.type.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.releaseStats}>
            {item.status === 'live' && (
              <>
                <Text style={styles.streamsCount}>{formatStreams(item.streams)}</Text>
                <Text style={styles.streamsLabel}>streams</Text>
              </>
            )}
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

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
            <Ionicons name="disc" size={12} color={colors.primary} style={{ marginRight: 4 }} />
            RELEASES
          </Badge>

          <TouchableOpacity onPress={() => navigateTo.profile()} style={styles.avatar}>
            <Ionicons name="person" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </BlurView>

      <View style={[styles.content, { paddingTop: insets.top + 70 }]}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Tabs
            tabs={tabs}
            value={activeTab}
            onValueChange={setActiveTab}
            variant="pills"
          />
        </View>

        {/* Releases List */}
        <FlatList
          data={filteredReleases}
          renderItem={renderReleaseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="disc-outline" size={48} color={colors.mutedForeground} />
              </View>
              <Text style={styles.emptyTitle}>No releases yet</Text>
              <Text style={styles.emptyDescription}>
                Upload your first track to get started
              </Text>
              <Button
                variant="default"
                onPress={() => navigateTo.upload()}
                style={styles.uploadButton}
              >
                <Ionicons name="cloud-upload" size={20} color={colors.primaryForeground} />
                <Text style={styles.uploadButtonText}>Upload Release</Text>
              </Button>
            </View>
          }
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        onPress={() => navigateTo.upload()}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryGlow]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={colors.primaryForeground} />
        </LinearGradient>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  listContent: {
    paddingHorizontal: spacing[4],
  },
  releaseCard: {
    marginBottom: spacing[3],
  },
  releaseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
  },
  coverArt: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  releaseInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  releaseTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.foreground,
  },
  releaseArtist: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  releaseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  releaseType: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedForeground,
  },
  releaseStats: {
    alignItems: 'flex-end',
  },
  streamsCount: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
  streamsLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedForeground,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[12],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.foreground,
    marginBottom: spacing[2],
  },
  emptyDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  uploadButtonText: {
    color: colors.primaryForeground,
    fontFamily: typography.fontFamily.medium,
  },
  fab: {
    position: 'absolute',
    right: spacing[4],
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ReleasesScreen;
