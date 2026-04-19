/**
 * TransactionRow - React Native
 * Transaction list item for wallet/earnings
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Badge from '../ui/Badge';

type TransactionType = 'credit' | 'debit' | 'pending' | 'failed';
type TransactionCategory = 'streaming' | 'withdrawal' | 'campaign' | 'refund' | 'bonus';

interface TransactionRowProps {
  title: string;
  description?: string;
  amount: string;
  type: TransactionType;
  category?: TransactionCategory;
  date: string;
  status?: string;
  onPress?: () => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  title,
  description,
  amount,
  type,
  category = 'streaming',
  date,
  status,
  onPress,
}) => {
  const getIcon = (): string => {
    switch (category) {
      case 'streaming':
        return 'musical-notes';
      case 'withdrawal':
        return 'arrow-up-circle';
      case 'campaign':
        return 'rocket';
      case 'refund':
        return 'refresh-circle';
      case 'bonus':
        return 'gift';
      default:
        return 'cash';
    }
  };

  const getIconContainerColor = (): string => {
    switch (type) {
      case 'credit':
        return colors.success + '20';
      case 'debit':
        return colors.destructive + '20';
      case 'pending':
        return colors.warning + '20';
      case 'failed':
        return colors.mutedForeground + '20';
      default:
        return colors.primary + '20';
    }
  };

  const getIconColor = (): string => {
    switch (type) {
      case 'credit':
        return colors.success;
      case 'debit':
        return colors.destructive;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.mutedForeground;
      default:
        return colors.primary;
    }
  };

  const getAmountColor = (): string => {
    switch (type) {
      case 'credit':
        return colors.success;
      case 'debit':
        return colors.destructive;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.mutedForeground;
      default:
        return colors.cardForeground;
    }
  };

  const getAmountPrefix = (): string => {
    if (type === 'credit') return '+';
    if (type === 'debit') return '-';
    return '';
  };

  const getStatusVariant = () => {
    switch (type) {
      case 'credit':
        return 'success';
      case 'debit':
        return 'default';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: getIconContainerColor() }]}>
        <Ionicons name={getIcon() as any} size={20} color={getIconColor()} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.amount, { color: getAmountColor() }]}>
            {getAmountPrefix()}{amount}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.date}>{date}</Text>
          {status && (
            <Badge variant={getStatusVariant() as any} style={styles.statusBadge}>
              {status}
            </Badge>
          )}
        </View>
        {description && (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      {/* Chevron */}
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.cardForeground,
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  description: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
});

export default TransactionRow;
