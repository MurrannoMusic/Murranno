/**
 * Clients Screen (Agency)
 * Displays and manages agency clients
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
import { colors, typography, spacing, borderRadius } from '../theme';
import { glassmorphism } from '../theme/glassmorphism';
import { PageHeader, SearchInput, FilterPills, EmptyState } from '../components/shared';

interface AgencyClient {
  id: string;
  name: string;
  type: 'artist' | 'label';
  profileImage?: string;
  status: 'active' | 'pending' | 'inactive';
  commission: number;
  activeCampaigns: number;
  totalSpend: number;
}

const mockClients: AgencyClient[] = [
  {
    id: '1',
    name: 'Afrobeats Records',
    type: 'label',
    status: 'active',
    commission: 15,
    activeCampaigns: 3,
    totalSpend: 450000,
  },
  {
    id: '2',
    name: 'DJ Waves',
    type: 'artist',
    status: 'active',
    commission: 20,
    activeCampaigns: 2,
    totalSpend: 180000,
  },
  {
    id: '3',
    name: 'Melody Queen',
    type: 'artist',
    status: 'pending',
    commission: 18,
    activeCampaigns: 0,
    totalSpend: 0,
  },
];

const filters = [
  { id: 'all', label: 'All' },
  { id: 'artist', label: 'Artists' },
  { id: 'label', label: 'Labels' },
];

export const ClientsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredClients = mockClients
    .filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(client => 
      activeFilter === 'all' || client.type === activeFilter
    );

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: AgencyClient['status']) => {
    switch (status) {
      case 'active': return colors.success;
      case 'pending': return colors.warning;
      case 'inactive': return colors.muted;
    }
  };

  const renderClientCard = ({ item }: { item: AgencyClient }) => (
    <TouchableOpacity
      style={[styles.clientCard, glassmorphism.card]}
      activeOpacity={0.8}
    >
      <View style={styles.clientHeader}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.name}</Text>
          <View style={styles.badges}>
            <View style={[styles.typeBadge, item.type === 'label' && styles.labelBadge]}>
              <Text style={[styles.typeText, item.type === 'label' && styles.labelText]}>
                {item.type}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.commission}%</Text>
          <Text style={styles.statLabel}>Commission</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.activeCampaigns}</Text>
          <Text style={styles.statLabel}>Campaigns</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₦{(item.totalSpend / 1000).toFixed(0)}k</Text>
          <Text style={styles.statLabel}>Total Spend</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader 
        title="Clients" 
        showBack
        rightAction={{
          icon: 'plus',
          onPress: () => {},
        }}
      />

      <View style={styles.content}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search clients..."
        />

        <FilterPills
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <FlatList
          data={filteredClients}
          renderItem={renderClientCard}
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
              icon="briefcase"
              title="No Clients Found"
              description="Start building your client roster."
              actionLabel="Add Client"
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
  clientCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  clientHeader: {
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
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: colors.accentForeground,
  },
  clientInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  clientName: {
    ...typography.h4,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  labelBadge: {
    backgroundColor: colors.primary + '20',
  },
  typeText: {
    ...typography.caption,
    color: colors.secondaryForeground,
    textTransform: 'capitalize',
  },
  labelText: {
    color: colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
