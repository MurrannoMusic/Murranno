/**
 * AnalyticsScreen - React Native
 * Matches src/pages/Analytics.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { colors } from '../theme/colors';
import { gradients } from '../theme/gradients';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AnalyticsTabId = 'streams' | 'tracks' | 'playlists' | 'stores' | 'audience';
type TimePeriodId = 'week' | 'month' | '90days' | 'year';

interface Tab {
  id: AnalyticsTabId;
  label: string;
}

interface TimePeriod {
  id: TimePeriodId;
  label: string;
  days: number;
}

const tabs: Tab[] = [
  { id: 'streams', label: 'Streams' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'stores', label: 'Stores' },
  { id: 'audience', label: 'Audience' },
];

const timePeriods: TimePeriod[] = [
  { id: 'week', label: 'Week', days: 7 },
  { id: 'month', label: 'Month', days: 30 },
  { id: '90days', label: '90 Days', days: 90 },
  { id: 'year', label: 'Year', days: 365 },
];

// Mock chart data
const mockChartData = [45, 52, 38, 65, 55, 72, 60, 48, 75, 68, 82, 78];

const AnalyticsScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const [activeTab, setActiveTab] = useState<AnalyticsTabId>('streams');
  const [activePeriod, setActivePeriod] = useState<TimePeriodId>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Mock stats
  const stats = {
    current: '1.2M',
    previous: '980K',
    change: '+22.4%',
    isPositive: true,
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const maxChartValue = Math.max(...mockChartData);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={gradients.dark.colors} style={styles.header}>
        <BlurView intensity={20} tint="dark" style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/mm_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Badge variant="primary">ANALYTICS</Badge>
          <TouchableOpacity style={styles.avatarButton}>
            <Ionicons name="person-circle" size={32} color={colors.primary} />
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
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
        {/* Analytics Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Title & Filter */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>
            {tabs.find((t) => t.id === activeTab)?.label}
          </Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={16} color={colors.foreground} />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Time Period Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodContainer}
        >
          {timePeriods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                activePeriod === period.id && styles.periodButtonActive,
              ]}
              onPress={() => setActivePeriod(period.id)}
            >
              <Text
                style={[
                  styles.periodText,
                  activePeriod === period.id && styles.periodTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats Comparison Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsLabel}>
              {tabs.find((t) => t.id === activeTab)?.label}
            </Text>
            <View
              style={[
                styles.changeIndicator,
                stats.isPositive ? styles.changePositive : styles.changeNegative,
              ]}
            >
              <Ionicons
                name={stats.isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={stats.isPositive ? colors.success : colors.destructive}
              />
              <Text
                style={[
                  styles.changeText,
                  stats.isPositive ? styles.changeTextPositive : styles.changeTextNegative,
                ]}
              >
                {stats.change}
              </Text>
            </View>
          </View>
          <View style={styles.statsValues}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.current}</Text>
              <Text style={styles.statPeriod}>This period</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValueSecondary}>{stats.previous}</Text>
              <Text style={styles.statPeriod}>Last period</Text>
            </View>
          </View>
        </Card>

        {/* Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Performance Overview</Text>
          <View style={styles.chartContainer}>
            {mockChartData.map((value, index) => (
              <View key={index} style={styles.barWrapper}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryGlow]}
                  style={[
                    styles.bar,
                    {
                      height: (value / maxChartValue) * 120,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Top Performing */}
        <Card style={styles.topCard}>
          <Text style={styles.sectionTitle}>Top Performing</Text>
          {[
            { title: 'Track A', value: '456K streams', icon: 'musical-notes' },
            { title: 'Track B', value: '312K streams', icon: 'musical-notes' },
            { title: 'Track C', value: '189K streams', icon: 'musical-notes' },
          ].map((item, index) => (
            <View key={index} style={styles.topItem}>
              <View style={styles.topItemRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.topItemInfo}>
                <Text style={styles.topItemTitle}>{item.title}</Text>
                <Text style={styles.topItemValue}>{item.value}</Text>
              </View>
              <Ionicons name={item.icon as any} size={20} color={colors.primary} />
            </View>
          ))}
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    height: 32,
    width: 100,
  },
  avatarButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  tabsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.foreground,
  },
  periodContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  periodTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  statsCard: {
    padding: 20,
    borderRadius: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changePositive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  changeNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  changeTextPositive: {
    color: colors.success,
  },
  changeTextNegative: {
    color: colors.destructive,
  },
  statsValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.cardForeground,
  },
  statValueSecondary: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  statPeriod: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  chartCard: {
    padding: 20,
    borderRadius: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.cardForeground,
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    paddingTop: 10,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 16,
    borderRadius: 8,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 10,
    color: colors.mutedForeground,
    marginTop: 8,
  },
  topCard: {
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.cardForeground,
    marginBottom: 16,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  topItemRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  topItemInfo: {
    flex: 1,
  },
  topItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.cardForeground,
  },
  topItemValue: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default AnalyticsScreen;
