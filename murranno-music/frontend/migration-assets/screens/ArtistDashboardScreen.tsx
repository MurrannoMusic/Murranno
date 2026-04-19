import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
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
import { StatCard } from '../components/modern/StatCard';
import { useAppNavigation } from '../hooks/useAppNavigation';

// Placeholder hooks - implement these in your project
// import { useUserType } from '../hooks/useUserType';
// import { useStats } from '../hooks/useStats';
// import { useRecentActivity } from '../hooks/useRecentActivity';

const ArtistDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigateTo } = useAppNavigation();
  const [refreshing, setRefreshing] = React.useState(false);

  // Mock data - replace with actual hooks
  const stats = [
    { id: '1', title: 'Total Streams', value: '245.8K', change: 12.5, changeType: 'positive' as const },
    { id: '2', title: 'Total Earnings', value: '₦125,000', change: 8.2, changeType: 'positive' as const },
    { id: '3', title: 'Releases', value: '12', change: 0, changeType: 'neutral' as const },
  ];

  const activities = [
    { id: '1', title: 'New streaming royalty', value: '+₦2,500', time: '2 hours ago', icon: 'cash', type: 'success' },
    { id: '2', title: 'Track uploaded', value: 'Midnight Vibes', time: 'Yesterday', icon: 'cloud-upload', type: 'primary' },
    { id: '3', title: '1,000 streams milestone', value: 'Summer Heat', time: '2 days ago', icon: 'play', type: 'primary' },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Refetch data here
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

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
          {/* Logo */}
          <TouchableOpacity>
            {/* Replace with your logo */}
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>MM</Text>
            </View>
          </TouchableOpacity>

          {/* User Type Badge */}
          <Badge variant="default" style={styles.userTypeBadge}>
            ARTIST
          </Badge>

          {/* Avatar */}
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
        {/* Performance Insights Header */}
        <Text style={styles.sectionTitle}>Performance Insights</Text>

        {/* Stats Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsCarousel}
        >
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              style={styles.statCard}
            />
          ))}
        </ScrollView>

        {/* Earnings Card */}
        <Card style={styles.earningsCard}>
          <View style={styles.earningsContent}>
            <View style={styles.earningsIcon}>
              <Ionicons name="cash" size={20} color={colors.primary} />
            </View>
            <View style={styles.earningsInfo}>
              <Text style={styles.earningsValue}>₦125,000</Text>
              <Text style={styles.earningsLabel}>Total Earnings</Text>
            </View>
            <View style={styles.earningsChange}>
              <Text style={styles.earningsChangeText}>+12%</Text>
            </View>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <CardHeader>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="time" size={20} color={colors.primary} />
              <CardTitle>Recent Activity</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <Text style={styles.emptyText}>
                No recent activity. Upload your first release to get started!
              </Text>
            ) : (
              <View style={styles.activityList}>
                {activities.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <Ionicons
                        name={activity.icon as any}
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.activityInfo}>
                      <View style={styles.activityRow}>
                        <Text style={styles.activityTitle} numberOfLines={1}>
                          {activity.title}
                        </Text>
                        <Text
                          style={[
                            styles.activityValue,
                            activity.type === 'success' && { color: colors.success },
                          ]}
                        >
                          {activity.value}
                        </Text>
                      </View>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigateTo.upload()}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="cloud-upload" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Upload</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigateTo.promotions()}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="megaphone" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Promote</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigateTo.analytics()}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="bar-chart" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.foreground,
    marginBottom: spacing[3],
  },
  statsCarousel: {
    paddingRight: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCard: {
    width: 160,
  },
  earningsCard: {
    marginBottom: spacing[4],
  },
  earningsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  earningsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  earningsValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
  earningsLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  earningsChange: {
    alignItems: 'flex-end',
  },
  earningsChangeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.success,
  },
  activityCard: {
    marginBottom: spacing[4],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  emptyText: {
    textAlign: 'center',
    color: colors.mutedForeground,
    fontSize: typography.fontSizes.sm,
    paddingVertical: spacing[8],
  },
  activityList: {
    gap: spacing[3],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: `${colors.secondary}20`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.foreground,
    flex: 1,
  },
  activityValue: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
    marginLeft: spacing[2],
  },
  activityTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing[2],
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  quickActionText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.mutedForeground,
  },
});

export default ArtistDashboardScreen;
