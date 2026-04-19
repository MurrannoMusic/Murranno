import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { LinearGradient } from 'expo-linear-gradient';

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'pending';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  source?: string;
}

interface PayoutMethod {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
}

const WalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'methods' | 'history'>('balance');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const walletBalance = {
    available: 125000,
    pending: 45000,
    totalEarnings: 890000,
  };

  const transactions: Transaction[] = [
    { id: '1', type: 'earning', description: 'Spotify Streams - December', amount: 32500, date: '2024-01-15', status: 'completed', source: 'Spotify' },
    { id: '2', type: 'earning', description: 'Apple Music Streams', amount: 18200, date: '2024-01-14', status: 'completed', source: 'Apple Music' },
    { id: '3', type: 'withdrawal', description: 'Bank Transfer', amount: -50000, date: '2024-01-10', status: 'completed' },
    { id: '4', type: 'pending', description: 'YouTube Music Streams', amount: 12500, date: '2024-01-12', status: 'pending', source: 'YouTube' },
    { id: '5', type: 'earning', description: 'Audiomack Streams', amount: 8500, date: '2024-01-08', status: 'completed', source: 'Audiomack' },
  ];

  const payoutMethods: PayoutMethod[] = [
    { id: '1', bankName: 'GTBank', accountNumber: '****4521', accountName: 'John Doe', isPrimary: true },
    { id: '2', bankName: 'First Bank', accountNumber: '****7832', accountName: 'John Doe', isPrimary: false },
  ];

  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    return `₦${absAmount.toLocaleString()}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning': return 'arrow-down-circle';
      case 'withdrawal': return 'arrow-up-circle';
      case 'pending': return 'time';
      default: return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning': return colors.success;
      case 'withdrawal': return colors.destructive;
      case 'pending': return colors.warning;
      default: return colors.muted;
    }
  };

  const renderBalanceTab = () => (
    <View style={styles.tabContent}>
      {/* Balance Cards */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mainBalanceCard}
      >
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(walletBalance.available)}</Text>
        <TouchableOpacity 
          style={styles.withdrawButton}
          onPress={() => setShowWithdrawModal(true)}
        >
          <Ionicons name="arrow-up" size={18} color={colors.primary} />
          <Text style={styles.withdrawButtonText}>Withdraw</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.secondaryBalanceRow}>
        <View style={styles.secondaryBalanceCard}>
          <Ionicons name="time" size={24} color={colors.warning} />
          <Text style={styles.secondaryBalanceLabel}>Pending</Text>
          <Text style={styles.secondaryBalanceAmount}>{formatCurrency(walletBalance.pending)}</Text>
        </View>
        <View style={styles.secondaryBalanceCard}>
          <Ionicons name="trending-up" size={24} color={colors.success} />
          <Text style={styles.secondaryBalanceLabel}>Total Earnings</Text>
          <Text style={styles.secondaryBalanceAmount}>{formatCurrency(walletBalance.totalEarnings)}</Text>
        </View>
      </View>

      {/* Earning Sources */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earning Sources</Text>
        <View style={styles.sourcesList}>
          {[
            { name: 'Spotify', amount: 450000, color: '#1DB954' },
            { name: 'Apple Music', amount: 280000, color: '#FC3C44' },
            { name: 'YouTube', amount: 95000, color: '#FF0000' },
            { name: 'Others', amount: 65000, color: colors.muted },
          ].map((source) => (
            <View key={source.name} style={styles.sourceItem}>
              <View style={[styles.sourceDot, { backgroundColor: source.color }]} />
              <Text style={styles.sourceName}>{source.name}</Text>
              <Text style={styles.sourceAmount}>{formatCurrency(source.amount)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => setActiveTab('history')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {transactions.slice(0, 3).map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(transaction.type) + '20' }]}>
              <Ionicons 
                name={getTransactionIcon(transaction.type) as any} 
                size={20} 
                color={getTransactionColor(transaction.type)} 
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              { color: transaction.amount >= 0 ? colors.success : colors.destructive }
            ]}>
              {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMethodsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <TouchableOpacity style={styles.addMethodButton}>
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={styles.addMethodText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {payoutMethods.map((method) => (
          <View key={method.id} style={styles.methodCard}>
            <View style={styles.methodIcon}>
              <Ionicons name="card" size={24} color={colors.primary} />
            </View>
            <View style={styles.methodInfo}>
              <View style={styles.methodHeader}>
                <Text style={styles.methodBankName}>{method.bankName}</Text>
                {method.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Primary</Text>
                  </View>
                )}
              </View>
              <Text style={styles.methodAccountNumber}>{method.accountNumber}</Text>
              <Text style={styles.methodAccountName}>{method.accountName}</Text>
            </View>
            <TouchableOpacity style={styles.methodMenu}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Withdrawal Settings</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Minimum Withdrawal</Text>
            <Text style={styles.settingValue}>₦5,000</Text>
          </View>
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Processing Time</Text>
            <Text style={styles.settingValue}>1-3 Business Days</Text>
          </View>
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Transfer Fee</Text>
            <Text style={styles.settingValue}>₦50</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(item.type) + '20' }]}>
              <Ionicons 
                name={getTransactionIcon(item.type) as any} 
                size={20} 
                color={getTransactionColor(item.type)} 
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{item.description}</Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
              {item.source && <Text style={styles.transactionSource}>{item.source}</Text>}
            </View>
            <View style={styles.transactionRight}>
              <Text style={[
                styles.transactionAmount,
                { color: item.amount >= 0 ? colors.success : colors.destructive }
              ]}>
                {item.amount >= 0 ? '+' : ''}{formatCurrency(item.amount)}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? colors.success + '20' : colors.warning + '20' }]}>
                <Text style={[styles.statusText, { color: item.status === 'completed' ? colors.success : colors.warning }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        )}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['balance', 'methods', 'history'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'balance' && renderBalanceTab()}
        {activeTab === 'methods' && renderMethodsTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Withdraw Funds</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (₦)</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter amount"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />
              <Text style={styles.availableText}>
                Available: {formatCurrency(walletBalance.available)}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Withdraw To</Text>
              <View style={styles.selectedMethod}>
                <Ionicons name="card" size={20} color={colors.primary} />
                <Text style={styles.selectedMethodText}>GTBank - ****4521</Text>
                <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowWithdrawModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  mainBalanceCard: {
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  withdrawButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  secondaryBalanceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  secondaryBalanceCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  secondaryBalanceLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  secondaryBalanceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
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
  },
  seeAllText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  sourcesList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.sm,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  sourceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  sourceName: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
  },
  sourceAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  transactionSource: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addMethodText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  methodBankName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  primaryBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  methodAccountNumber: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  methodAccountName: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  methodMenu: {
    padding: spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: colors.foreground,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.muted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  amountInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  availableText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  selectedMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  selectedMethodText: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
});

export default WalletScreen;
