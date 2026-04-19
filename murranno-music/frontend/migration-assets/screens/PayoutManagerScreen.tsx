/**
 * Payout Manager Screen (Label)
 * Manage artist payouts and revenue splits
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';
import { glassmorphism } from '../theme/glassmorphism';
import { PageHeader, FilterPills } from '../components/shared';

interface PayoutRecord {
  id: string;
  artistName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: string;
  period: string;
}

const mockPayouts: PayoutRecord[] = [
  {
    id: '1',
    artistName: 'DJ Waves',
    amount: 45000,
    currency: '₦',
    status: 'completed',
    date: '2024-01-15',
    period: 'Dec 2023',
  },
  {
    id: '2',
    artistName: 'MC Thunder',
    amount: 32000,
    currency: '₦',
    status: 'processing',
    date: '2024-01-14',
    period: 'Dec 2023',
  },
  {
    id: '3',
    artistName: 'Melody Queen',
    amount: 18500,
    currency: '₦',
    status: 'pending',
    date: '2024-01-13',
    period: 'Dec 2023',
  },
];

const filters = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'completed', label: 'Completed' },
];

export const PayoutManagerScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredPayouts = activeFilter === 'all'
    ? mockPayouts
    : mockPayouts.filter(p => p.status === activeFilter);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusStyle = (status: PayoutRecord['status']) => {
    switch (status) {
      case 'completed':
        return { bg: colors.success + '20', text: colors.success };
      case 'processing':
        return { bg: colors.primary + '20', text: colors.primary };
      case 'pending':
        return { bg: colors.warning + '20', text: colors.warning };
      case 'failed':
        return { bg: colors.destructive + '20', text: colors.destructive };
    }
  };

  const renderPayoutCard = ({ item }: { item: PayoutRecord }) => {
    const statusStyle = getStatusStyle(item.status);
    
    return (
      <TouchableOpacity
        style={[styles.payoutCard, glassmorphism.card]}
        activeOpacity={0.8}
      >
        <View style={styles.payoutHeader}>
          <View>
            <Text style={styles.artistName}>{item.artistName}</Text>
            <Text style={styles.period}>{item.period}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.payoutDetails}>
          <View>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amount}>
              {item.currency}{item.amount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Date</Text>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate summary
  const totalPending = mockPayouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Payout Manager" showBack />

      <View style={styles.content}>
        {/* Summary Card */}
        <View style={[styles.summaryCard, glassmorphism.cardPrimary]}>
          <Text style={styles.summaryLabel}>Pending Payouts</Text>
          <Text style={styles.summaryAmount}>₦{totalPending.toLocaleString()}</Text>
          <TouchableOpacity style={styles.processButton}>
            <Text style={styles.processButtonText}>Process All</Text>
          </TouchableOpacity>
        </View>

        <FilterPills
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <FlatList
          data={filteredPayouts}
          renderItem={renderPayoutCard}
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
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.primaryForeground,
    opacity: 0.8,
  },
  summaryAmount: {
    ...typography.h1,
    color: colors.primaryForeground,
    marginVertical: spacing.sm,
  },
  processButton: {
    backgroundColor: colors.primaryForeground,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  processButtonText: {
    ...typography.buttonSmall,
    color: colors.primary,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  payoutCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  artistName: {
    ...typography.h4,
    color: colors.foreground,
  },
  period: {
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
  payoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  amount: {
    ...typography.h3,
    color: colors.foreground,
    marginTop: spacing.xs,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  date: {
    ...typography.body,
    color: colors.foreground,
    marginTop: spacing.xs,
  },
});
