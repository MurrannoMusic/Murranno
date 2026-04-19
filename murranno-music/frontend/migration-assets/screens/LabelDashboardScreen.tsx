/**
 * LabelDashboardScreen - React Native
 * Matches src/pages/LabelDashboard.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
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

interface Activity {
  id: string;
  title: string;
  description: string;
  value: string;
  type: 'success' | 'primary' | 'default';
  icon: 'dollar' | 'upload' | 'play';
}

const LabelDashboardScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  // Mock data
  const stats = {
    totalEarnings: '₦2,450,000',
    totalStreams: '1.2M',
    earningsChange: '+12%',
    streamsChange: '+23%',
  };

  const artists = [
    { id: '1', name: 'Artist One', image: null },
    { id: '2', name: 'Artist Two', image: null },
    { id: '3', name: 'Artist Three', image: null },
  ];

  const activities: Activity[] = [
    {
      id: '1',
      title: 'New Earnings',
      description: 'Monthly streaming revenue',
      value: '+₦125,000',
      type: 'success',
      icon: 'dollar',
    },
    {
      id: '2',
      title: 'Track Uploaded',
      description: 'Summer Vibes by Artist One',
      value: 'Published',
      type: 'primary',
      icon: 'upload',
    },
    {
      id: '3',
      title: 'Milestone Reached',
      description: '100K streams on Latest Hit',
      value: '100K',
      type: 'default',
      icon: 'play',
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getActivityIcon = (icon: Activity['icon']) => {
    switch (icon) {
      case 'dollar':
        return 'cash';
      case 'upload':
        return 'cloud-upload';
      case 'play':
        return 'play-circle';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'primary':
        return colors.primary;
      default:
        return colors.cardForeground;
    }
  };

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
          <Badge variant="secondary">LABEL</Badge>
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
        {/* Artist Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.artistSelector}
        >
          <TouchableOpacity
            style={[
              styles.artistChip,
              !selectedArtist && styles.artistChipActive,
            ]}
            onPress={() => setSelectedArtist(null)}
          >
            <Ionicons name="people" size={16} color={!selectedArtist ? colors.white : colors.foreground} />
            <Text style={[styles.artistChipText, !selectedArtist && styles.artistChipTextActive]}>
              All Artists
            </Text>
          </TouchableOpacity>
          {artists.map((artist) => (
            <TouchableOpacity
              key={artist.id}
              style={[
                styles.artistChip,
                selectedArtist === artist.id && styles.artistChipActive,
              ]}
              onPress={() => setSelectedArtist(artist.id)}
            >
              <Ionicons
                name="person"
                size={16}
                color={selectedArtist === artist.id ? colors.white : colors.foreground}
              />
              <Text
                style={[
                  styles.artistChipText,
                  selectedArtist === artist.id && styles.artistChipTextActive,
                ]}
              >
                {artist.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={styles.statIconContainer}>
                <Ionicons name="cash" size={16} color={colors.primary} />
              </View>
              <Text style={styles.statChange}>{stats.earningsChange}</Text>
            </View>
            <Text style={styles.statValue}>{stats.totalEarnings}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={16} color={colors.primary} />
              </View>
              <Text style={styles.statChange}>{stats.streamsChange}</Text>
            </View>
            <Text style={styles.statValue}>{stats.totalStreams}</Text>
            <Text style={styles.statLabel}>Total Streams</Text>
          </View>
        </View>

        {/* Performance Insights */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insightsCarousel}
        >
          {['Streams', 'Earnings', 'Listeners'].map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <LinearGradient
                colors={gradients.cardOverlay.colors}
                style={styles.insightGradient}
              >
                <Text style={styles.insightTitle}>{insight}</Text>
                <Text style={styles.insightValue}>
                  {index === 0 ? '450K' : index === 1 ? '₦850K' : '25K'}
                </Text>
                <Text style={styles.insightChange}>+15% from last month</Text>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Recent Activity</Text>
          </View>
          
          {activities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No recent activity. Your artists' releases and earnings will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {activities.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIconContainer}>
                    <Ionicons
                      name={getActivityIcon(activity.icon) as any}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <View style={styles.activityRow}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={[styles.activityValue, { color: getActivityColor(activity.type) }]}>
                        {activity.value}
                      </Text>
                    </View>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
          </View>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButtonPrimary}
              onPress={() => navigation.navigate('Upload')}
            >
              <LinearGradient
                colors={gradients.primary.colors}
                start={gradients.primary.start}
                end={gradients.primary.end}
                style={styles.actionGradient}
              >
                <Text style={styles.actionTextPrimary}>Upload Track</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('Promotions')}
            >
              <Text style={styles.actionTextSecondary}>Start Campaign</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Text style={styles.actionTextSecondary}>View Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => {}}
            >
              <Text style={styles.actionTextSecondary}>Manage Payouts</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => {}}
          >
            <LinearGradient
              colors={gradients.primary.colors}
              start={gradients.primary.start}
              end={gradients.primary.end}
              style={styles.actionGradient}
            >
              <Text style={styles.actionTextPrimary}>Manage Artists</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Upload')}
      >
        <LinearGradient
          colors={gradients.primary.colors}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
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
  artistSelector: {
    gap: 8,
    paddingVertical: 4,
  },
  artistChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  artistChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  artistChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  artistChipTextActive: {
    color: colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statChange: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.success,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.cardForeground,
  },
  statLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.cardForeground,
  },
  insightsCarousel: {
    gap: 12,
    paddingVertical: 4,
  },
  insightCard: {
    width: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  insightGradient: {
    padding: 16,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
    opacity: 0.8,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginTop: 8,
  },
  insightChange: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.7,
    marginTop: 4,
  },
  activityCard: {
    borderRadius: 20,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.cardForeground,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.cardForeground,
  },
  activityValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  activityDescription: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  actionsCard: {
    borderRadius: 20,
    padding: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButtonPrimary: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  actionButtonSecondary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  actionTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondaryForeground,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: 120,
  },
});

export default LabelDashboardScreen;
