/**
 * ActivityItem - React Native
 * Recent activity list item component
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

type ActivityType = 'earning' | 'upload' | 'stream' | 'campaign' | 'release' | 'withdrawal';

interface ActivityItemProps {
  title: string;
  description: string;
  value?: string;
  type?: ActivityType;
  timestamp?: string;
  onPress?: () => void;
  isPositive?: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  title,
  description,
  value,
  type = 'stream',
  timestamp,
  onPress,
  isPositive = true,
}) => {
  const getIcon = (): string => {
    switch (type) {
      case 'earning':
        return 'cash';
      case 'upload':
        return 'cloud-upload';
      case 'stream':
        return 'play-circle';
      case 'campaign':
        return 'rocket';
      case 'release':
        return 'disc';
      case 'withdrawal':
        return 'wallet';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = (): string => {
    switch (type) {
      case 'earning':
        return colors.success;
      case 'withdrawal':
        return colors.warning;
      case 'campaign':
        return colors.accent;
      default:
        return colors.primary;
    }
  };

  const getValueColor = (): string => {
    if (type === 'earning') return colors.success;
    if (type === 'withdrawal') return colors.warning;
    if (isPositive) return colors.cardForeground;
    return colors.destructive;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
        <Ionicons name={getIcon() as any} size={20} color={getIconColor()} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {value && (
            <Text style={[styles.value, { color: getValueColor() }]}>
              {value}
            </Text>
          )}
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
          {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
        </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.cardForeground,
    flex: 1,
    marginRight: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 12,
    color: colors.mutedForeground,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
});

export default ActivityItem;
