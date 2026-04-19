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
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Sheet } from '../components/ui/Sheet';
import { useAppNavigation } from '../hooks/useAppNavigation';

const EarningsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigateTo } = useAppNavigation();
  const [activeTab, setActiveTab] = useState('balance');
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);

  // Mock data - replace with actual hooks
  const balance = {
    available: 125000,
    pending: 15000,
    total: 140000,
  };

  const earningsSources = [
    { id: '1', name: 'Spotify', amount: 45000, percentage: 36 },
    { id: '2', name: 'Apple Music', amount: 38000, percentage: 30 },
    { id: '3', name: 'YouTube Music', amount: 25000, percentage: 20 },
    { id: '4', name: 'Others', amount: 17000, percentage: 14 },
  ];

  const transactions = [
    { id: '1', type: 'earning', title: 'Spotify Royalties', amount: 15000, date: 'Dec 10, 2025', status: 'completed' },
    { id: '2', type: 'withdrawal', title: 'Bank Transfer', amount: -50000, date: 'Dec 5, 2025', status: 'completed' },
    { id: '3', type: 'earning', title: 'Apple Music Royalties', amount: 12000, date: 'Dec 1, 2025', status: 'completed' },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const tabs = [
    { value: 'balance', label: 'Balance' },
    { value: 'methods', label: 'Methods' },
    { value: 'history', label: 'History' },
  ];

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
            <Ionicons name="wallet" size={12} color={colors.primary} style={{ marginRight: 4 }} />
            WALLET
          </Badge>

          <TouchableOpacity onPress={() => navigateTo.profile()} style={styles.avatar}>
            <Ionicons name="person" size={20} color={colors.foreground} />
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
        {/* Tabs */}
        <Tabs
          tabs={tabs}
          value={activeTab}
          onValueChange={setActiveTab}
          style={styles.tabs}
        />

        {activeTab === 'balance' && (
          <>
            {/* Balance Card */}
            <Card style={styles.balanceCard}>
              <CardContent style={styles.balanceContent}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceValue}>{formatCurrency(balance.available)}</Text>
                
                <View style={styles.balanceDetails}>
                  <View style={styles.balanceDetailItem}>
                    <Text style={styles.balanceDetailLabel}>Pending</Text>
                    <Text style={styles.balanceDetailValue}>{formatCurrency(balance.pending)}</Text>
                  </View>
                  <View style={styles.balanceDetailDivider} />
                  <View style={styles.balanceDetailItem}>
                    <Text style={styles.balanceDetailLabel}>Total Earned</Text>
                    <Text style={styles.balanceDetailValue}>{formatCurrency(balance.total)}</Text>
                  </View>
                </View>

                <Button
                  variant="default"
                  size="lg"
                  onPress={() => setShowWithdrawSheet(true)}
                  style={styles.withdrawButton}
                >
                  <Ionicons name="arrow-up" size={20} color={colors.primaryForeground} />
                  <Text style={styles.withdrawButtonText}>Withdraw</Text>
                </Button>
              </CardContent>
            </Card>

            {/* Earnings Sources */}
            <Card style={styles.sourcesCard}>
              <CardHeader>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="pie-chart" size={20} color={colors.primary} />
                  <CardTitle>Earnings by Source</CardTitle>
                </View>
              </CardHeader>
              <CardContent>
                <View style={styles.sourcesList}>
                  {earningsSources.map((source) => (
                    <View key={source.id} style={styles.sourceItem}>
                      <View style={styles.sourceInfo}>
                        <Text style={styles.sourceName}>{source.name}</Text>
                        <Text style={styles.sourceAmount}>{formatCurrency(source.amount)}</Text>
                      </View>
                      <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${source.percentage}%` }]} />
                      </View>
                      <Text style={styles.sourcePercentage}>{source.percentage}%</Text>
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'history' && (
          <Card style={styles.historyCard}>
            <CardHeader>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <CardTitle>Transaction History</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <View style={styles.transactionsList}>
                {transactions.map((tx) => (
                  <View key={tx.id} style={styles.transactionItem}>
                    <View style={[
                      styles.transactionIcon,
                      tx.type === 'withdrawal' && styles.transactionIconWithdrawal,
                    ]}>
                      <Ionicons
                        name={tx.type === 'earning' ? 'arrow-down' : 'arrow-up'}
                        size={20}
                        color={tx.type === 'earning' ? colors.success : colors.warning}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>{tx.title}</Text>
                      <Text style={styles.transactionDate}>{tx.date}</Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      tx.amount > 0 ? styles.amountPositive : styles.amountNegative,
                    ]}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                    </Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {activeTab === 'methods' && (
          <Card style={styles.methodsCard}>
            <CardHeader>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="card" size={20} color={colors.primary} />
                <CardTitle>Payout Methods</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <TouchableOpacity style={styles.addMethodButton}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
                <Text style={styles.addMethodText}>Add Bank Account</Text>
              </TouchableOpacity>
            </CardContent>
          </Card>
        )}
      </ScrollView>

      {/* Withdraw Sheet */}
      <Sheet
        visible={showWithdrawSheet}
        onClose={() => setShowWithdrawSheet(false)}
        title="Withdraw Funds"
        description="Enter the amount you want to withdraw"
        snapPoints={['50%']}
      >
        <Text style={styles.sheetText}>Withdrawal form goes here</Text>
      </Sheet>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
  },
  tabs: {
    marginBottom: spacing[4],
  },
  balanceCard: {
    marginBottom: spacing[4],
  },
  balanceContent: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  balanceLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
    marginBottom: spacing[2],
  },
  balanceValue: {
    fontSize: 40,
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
    marginBottom: spacing[4],
  },
  balanceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  balanceDetailItem: {
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  balanceDetailLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedForeground,
  },
  balanceDetailValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.foreground,
    marginTop: 2,
  },
  balanceDetailDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    width: '100%',
  },
  withdrawButtonText: {
    color: colors.primaryForeground,
    fontFamily: typography.fontFamily.semibold,
  },
  sourcesCard: {
    marginBottom: spacing[4],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  sourcesList: {
    gap: spacing[4],
  },
  sourceItem: {
    gap: spacing[2],
  },
  sourceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sourceName: {
    fontSize: typography.fontSizes.sm,
    color: colors.foreground,
  },
  sourceAmount: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.foreground,
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.muted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  sourcePercentage: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedForeground,
    textAlign: 'right',
  },
  historyCard: {
    marginBottom: spacing[4],
  },
  transactionsList: {
    gap: spacing[3],
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: `${colors.secondary}20`,
    borderRadius: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionIconWithdrawal: {
    backgroundColor: `${colors.warning}20`,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  transactionTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
  },
  transactionDate: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
  },
  amountPositive: {
    color: colors.success,
  },
  amountNegative: {
    color: colors.warning,
  },
  methodsCard: {
    marginBottom: spacing[4],
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 16,
    gap: spacing[2],
  },
  addMethodText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  sheetText: {
    color: colors.foreground,
    textAlign: 'center',
  },
});

export default EarningsScreen;
