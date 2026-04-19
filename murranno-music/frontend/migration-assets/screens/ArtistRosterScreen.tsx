/**
 * Artist Roster Screen (Label)
 * Displays all artists signed to the label
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { glassmorphism } from '../theme/glassmorphism';
import { PageHeader, SearchInput, EmptyState } from '../components/shared';

interface LabelArtist {
  id: string;
  artistId: string;
  stageName: string;
  profileImage?: string;
  status: 'active' | 'pending' | 'inactive';
  revenueShare: number;
  totalEarnings: number;
  releasesCount: number;
}

// Mock data
const mockArtists: LabelArtist[] = [
  {
    id: '1',
    artistId: 'a1',
    stageName: 'DJ Waves',
    profileImage: undefined,
    status: 'active',
    revenueShare: 70,
    totalEarnings: 125000,
    releasesCount: 8,
  },
  {
    id: '2',
    artistId: 'a2',
    stageName: 'MC Thunder',
    profileImage: undefined,
    status: 'active',
    revenueShare: 65,
    totalEarnings: 89000,
    releasesCount: 5,
  },
  {
    id: '3',
    artistId: 'a3',
    stageName: 'Melody Queen',
    profileImage: undefined,
    status: 'pending',
    revenueShare: 75,
    totalEarnings: 0,
    releasesCount: 0,
  },
];

export const ArtistRosterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredArtists = mockArtists.filter(artist =>
    artist.stageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: LabelArtist['status']) => {
    switch (status) {
      case 'active': return colors.success;
      case 'pending': return colors.warning;
      case 'inactive': return colors.muted;
    }
  };

  const renderArtistCard = ({ item }: { item: LabelArtist }) => (
    <TouchableOpacity
      style={[styles.artistCard, glassmorphism.card]}
      onPress={() => {
        // Navigate to artist detail
      }}
      activeOpacity={0.8}
    >
      <View style={styles.artistHeader}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.stageName.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.artistInfo}>
          <Text style={styles.artistName}>{item.stageName}</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.releasesCount}</Text>
          <Text style={styles.statLabel}>Releases</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.revenueShare}%</Text>
          <Text style={styles.statLabel}>Rev Share</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₦{(item.totalEarnings / 1000).toFixed(0)}k</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Artist Roster" showBack />

      <View style={styles.content}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search artists..."
        />

        <FlatList
          data={filteredArtists}
          renderItem={renderArtistCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="users"
              title="No Artists Found"
              description="You haven't added any artists to your roster yet."
              actionLabel="Add Artist"
              onAction={() => {}}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  artistCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  artistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: colors.primaryForeground,
  },
  artistInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  artistName: {
    ...typography.h4,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.mutedForeground,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    color: colors.foreground,
  },
  statLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
});
