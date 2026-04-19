import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'pending' | 'completed' | 'paused';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string;
}

const CampaignTrackingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = ['all', 'active', 'pending', 'completed', 'paused'];

  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'New Single Launch',
      platform: 'Instagram',
      status: 'active',
      budget: 50000,
      spent: 32500,
      impressions: 125000,
      clicks: 4200,
      startDate: '2024-01-10',
      endDate: '2024-02-10',
    },
    {
      id: '2',
      name: 'Album Promo',
      platform: 'TikTok',
      status: 'active',
      budget: 75000,
      spent: 45000,
      impressions: 280000,
      clicks: 12500,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
    },
    {
      id: '3',
      name: 'Playlist Pitching',
      platform: 'Spotify',
      status: 'pending',
      budget: 25000,
      spent: 0,
      impressions: 0,
      clicks: 0,
      startDate: '2024-02-01',
      endDate: '2024-03-01',
    },
    {
      id: '4',
      name: 'Music Video Boost',
      platform: 'YouTube',
      status: 'completed',
      budget: 100000,
      spent: 98500,
      impressions: 520000,
      clicks: 28000,
      startDate: '2023-12-01',
      endDate: '2024-01-01',
    },
  ];

  const filteredCampaigns = activeFilter === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.status === activeFilter);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'pending': return colors.warning;
      case 'completed': return colors.primary;
      case 'paused': return colors.muted;
      default: return colors.muted;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return 'logo-instagram';
      case 'tiktok': return 'logo-tiktok';
      case 'spotify': return 'musical-notes';
      case 'youtube': return 'logo-youtube';
      case 'facebook': return 'logo-facebook';
      default: return 'megaphone';
    }
  };

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const renderCampaignCard = ({ item }: { item: Campaign }) => {
    const progress = (item.spent / item.budget) * 100;
    
    return (
      <TouchableOpacity 
        style={styles.campaignCard}
        onPress={() => navigation.navigate('CampaignDetail', { campaignId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.platformBadge}>
            <Ionicons 
              name={getPlatformIcon(item.platform) as any} 
              size={18} 
              color={colors.primary} 
            />
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.campaignName}>{item.name}</Text>
            <Text style={styles.platformText}>{item.platform}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.budgetSection}>
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetValue}>{formatCurrency(item.budget)}</Text>
          </View>
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetLabel}>Spent</Text>
            <Text style={styles.spentValue}>{formatCurrency(item.spent)}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(progress, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Ionicons name="eye-outline" size={16} color={colors.mutedForeground} />
            <Text style={styles.metricValue}>{formatNumber(item.impressions)}</Text>
            <Text style={styles.metricLabel}>Impressions</Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="hand-left-outline" size={16} color={colors.mutedForeground} />
            <Text style={styles.metricValue}>{formatNumber(item.clicks)}</Text>
            <Text style={styles.metricLabel}>Clicks</Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="trending-up-outline" size={16} color={colors.mutedForeground} />
            <Text style={styles.metricValue}>
              {item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(1) : 0}%
            </Text>
            <Text style={styles.metricLabel}>CTR</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
          <Text style={styles.dateText}>{item.startDate} - {item.endDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campaign Tracking</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
              <Ionicons name="wallet" size={24} color={colors.primaryForeground} />
              <Text style={styles.summaryValueLight}>{formatCurrency(totalBudget)}</Text>
              <Text style={styles.summaryLabelLight}>Total Budget</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="cash" size={24} color={colors.primary} />
              <Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text>
              <Text style={styles.summaryLabel}>Total Spent</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Ionicons name="eye" size={24} color={colors.secondary} />
              <Text style={styles.summaryValue}>{formatNumber(totalImpressions)}</Text>
              <Text style={styles.summaryLabel}>Impressions</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="rocket" size={24} color={colors.success} />
              <Text style={styles.summaryValue}>{activeCampaigns}</Text>
              <Text style={styles.summaryLabel}>Active Campaigns</Text>
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                activeFilter === filter && styles.filterPillActive
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Campaigns List */}
        <View style={styles.campaignsSection}>
          <Text style={styles.sectionTitle}>
            {filteredCampaigns.length} Campaign{filteredCampaigns.length !== 1 ? 's' : ''}
          </Text>
          <FlatList
            data={filteredCampaigns}
            renderItem={renderCampaignCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.campaignsList}
          />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  summaryCardPrimary: {
    backgroundColor: colors.primary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: spacing.xs,
  },
  summaryValueLight: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryForeground,
    marginTop: spacing.xs,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  summaryLabelLight: {
    fontSize: 12,
    color: colors.primaryForeground + 'CC',
    marginTop: 2,
  },
  filterScroll: {
    marginTop: spacing.lg,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.primaryForeground,
  },
  campaignsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.md,
  },
  campaignsList: {
    paddingBottom: spacing.xxl,
  },
  campaignCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  platformBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  platformText: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  budgetSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  budgetInfo: {},
  budgetLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
  },
  spentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.muted,
    borderRadius: 3,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedForeground,
    width: 35,
    textAlign: 'right',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
});

export default CampaignTrackingScreen;
