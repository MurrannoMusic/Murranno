/**
 * Notifications Screen
 * Displays user notifications with mark as read
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
import { PageHeader, EmptyState } from '../components/shared';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  relatedType?: string;
  relatedId?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Release Approved',
    message: 'Your release "Summer Vibes" has been approved and is now live on all platforms.',
    type: 'success',
    isRead: false,
    createdAt: new Date().toISOString(),
    relatedType: 'release',
    relatedId: 'r1',
  },
  {
    id: '2',
    title: 'Earnings Update',
    message: 'Your December earnings of ₦45,000 are ready for withdrawal.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    relatedType: 'earnings',
  },
  {
    id: '3',
    title: 'Campaign Started',
    message: 'Your promotion campaign "New Year Push" has started running.',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    relatedType: 'campaign',
    relatedId: 'c1',
  },
  {
    id: '4',
    title: 'Payout Processed',
    message: 'Your withdrawal of ₦30,000 has been processed successfully.',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    relatedType: 'payout',
  },
];

export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return { color: colors.success, icon: '✓' };
      case 'warning': return { color: colors.warning, icon: '!' };
      case 'error': return { color: colors.destructive, icon: '✕' };
      default: return { color: colors.primary, icon: 'i' };
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const typeStyle = getTypeIcon(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          glassmorphism.card,
          !item.isRead && styles.unreadCard,
        ]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: typeStyle.color + '20' }]}>
          <Text style={[styles.icon, { color: typeStyle.color }]}>
            {typeStyle.icon}
          </Text>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.time}>{getTimeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader
        title="Notifications"
        showBack
        rightAction={
          unreadCount > 0
            ? {
                label: 'Mark all read',
                onPress: markAllAsRead,
              }
            : undefined
        }
      />

      <FlatList
        data={notifications}
        renderItem={renderNotification}
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
            icon="bell"
            title="No Notifications"
            description="You're all caught up! Check back later for updates."
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodyBold,
    color: colors.foreground,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  message: {
    ...typography.body,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
});
