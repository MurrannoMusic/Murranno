/**
 * Campaign Results Screen (Agency)
 * Displays campaign performance metrics
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';
import { glassmorphism } from '../theme/glassmorphism';
import { PageHeader, FilterPills } from '../components/shared';

interface CampaignResult {
  id: string;
  campaignName: string;
  clientName: string;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  metrics: {
    reach: number;
    impressions: number;
    engagement: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
}

const mockResults: CampaignResult[] = [
  {
    id: '1',
    campaignName: 'New Year Launch',
    clientName: 'Afrobeats Records',
    status: 'active',
    startDate: '2024-01-01',
    metrics: {
      reach: 125000,
      impressions: 450000,
      engagement: 32000,
      clicks: 8500,
      conversions: 420,
      spend: 150000,
    },
  },
  {
    id: '2',
    campaignName: 'Single Release Push',
    clientName: 'DJ Waves',
    status: 'completed',
    startDate: '2023-12-15',
    endDate: '2024-01-10',
    metrics: {
      reach: 89000,
      impressions: 280000,
      engagement: 18000,
      clicks: 5200,
      conversions: 280,
      spend: 85000,
    },
  },
];

const filters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export const CampaignResultsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredResults = activeFilter === 'all'
    ? mockResults
    : mockResults.filter(r => r.status === activeFilter);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: CampaignResult['status']) => {
    switch (status) {
      case 'active': return colors.success;
      case 'completed': return colors.primary;
      case 'paused': return colors.warning;
    }
  };

  const renderMetricCard = (label: string, value: string, subtext?: string) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {subtext && <Text style={styles.metricSubtext}>{subtext}</Text>}
    </View>
  );

  const renderCampaignCard = (result: CampaignResult) => {
    const ctr = ((result.metrics.clicks / result.metrics.impressions) * 100).toFixed(2);
    const cpc = (result.metrics.spend / result.metrics.clicks).toFixed(0);

    return (
      <View key={result.id} style={[styles.resultCard, glassmorphism.card]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.campaignName}>{result.campaignName}</Text>
            <Text style={styles.clientName}>{result.clientName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(result.status) }]}>
              {result.status}
            </Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          {renderMetricCard('Reach', formatNumber(result.metrics.reach))}
          {renderMetricCard('Impressions', formatNumber(result.metrics.impressions))}
          {renderMetricCard('Engagement', formatNumber(result.metrics.engagement))}
          {renderMetricCard('Clicks', formatNumber(result.metrics.clicks))}
          {renderMetricCard('CTR', `${ctr}%`)}
          {renderMetricCard('CPC', `₦${cpc}`)}
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.footerLabel}>Total Spend</Text>
            <Text style={styles.footerValue}>₦{result.metrics.spend.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Campaign Results" showBack />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <FilterPills
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {filteredResults.map(renderCampaignCard)}
      </ScrollView>
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
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  resultCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  campaignName: {
    ...typography.h4,
    color: colors.foreground,
  },
  clientName: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.md,
  },
  metricCard: {
    width: '33.33%',
    padding: spacing.xs,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: {
    ...typography.h4,
    color: colors.foreground,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  metricSubtext: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  footerLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  footerValue: {
    ...typography.h4,
    color: colors.foreground,
    marginTop: spacing.xs,
  },
  detailsButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  detailsButtonText: {
    ...typography.buttonSmall,
    color: colors.secondaryForeground,
  },
});
