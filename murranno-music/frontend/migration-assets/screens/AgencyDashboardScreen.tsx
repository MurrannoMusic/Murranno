/**
 * AgencyDashboardScreen - React Native
 * Matches src/pages/AgencyDashboard.tsx
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

interface Campaign {
  id: string;
  name: string;
  artist: string;
  platform: string;
  status: 'Active' | 'Pending' | 'Completed';
  budget: string;
  reach: string;
}

const AgencyDashboardScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data
  const stats = {
    activeCampaigns: 8,
    totalReach: '156K',
    campaignsChange: '+3',
    reachChange: '+28%',
  };

  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Summer Vibes Promo',
      artist: 'Artist One',
      platform: 'Spotify',
      status: 'Active',
      budget: '₦500,000',
      reach: '45K',
    },
    {
      id: '2',
      name: 'New Single Launch',
      artist: 'Artist Two',
      platform: 'Apple Music',
      status: 'Active',
      budget: '₦350,000',
      reach: '32K',
    },
    {
      id: '3',
      name: 'Album Release',
      artist: 'Artist Three',
      platform: 'All Platforms',
      status: 'Pending',
      budget: '₦750,000',
      reach: '0',
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return colors.success;
      case 'Pending':
        return colors.warning;
      case 'Completed':
        return colors.primary;
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
          <Badge variant="accent">AGENCY</Badge>
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
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={styles.statIconContainer}>
                <Ionicons name="rocket" size={16} color={colors.primary} />
              </View>
              <Text style={styles.statChange}>{stats.campaignsChange}</Text>
            </View>
            <Text style={styles.statValue}>{stats.activeCampaigns}</Text>
            <Text style={styles.statLabel}>Active Campaigns</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={16} color={colors.primary} />
              </View>
              <Text style={styles.statChange}>{stats.reachChange}</Text>
            </View>
            <Text style={styles.statValue}>{stats.totalReach}</Text>
            <Text style={styles.statLabel}>Total Reach</Text>
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
          {['Impressions', 'Clicks', 'Conversions'].map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <LinearGradient
                colors={gradients.accent.colors}
                style={styles.insightGradient}
              >
                <Text style={styles.insightTitle}>{insight}</Text>
                <Text style={styles.insightValue}>
                  {index === 0 ? '2.5M' : index === 1 ? '125K' : '8.2K'}
                </Text>
                <Text style={styles.insightChange}>+18% from last month</Text>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>

        {/* Active Campaigns */}
        <Card style={styles.campaignsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Active Campaigns</Text>
          </View>
          
          {campaigns.filter(c => c.status === 'Active').length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No active campaigns. Start a new campaign to promote your artists.
              </Text>
            </View>
          ) : (
            <View style={styles.campaignList}>
              {campaigns.filter(c => c.status === 'Active' || c.status === 'Pending').map((campaign) => (
                <View key={campaign.id} style={styles.campaignItem}>
                  <View style={styles.campaignIconContainer}>
                    <Ionicons name="rocket" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.campaignInfo}>
                    <View style={styles.campaignRow}>
                      <View style={styles.campaignTitleRow}>
                        <Text style={styles.campaignArtist}>{campaign.artist}</Text>
                        <Badge
                          variant={campaign.status === 'Active' ? 'default' : 'secondary'}
                          style={{ backgroundColor: getStatusColor(campaign.status) + '20' }}
                        >
                          <Text style={{ color: getStatusColor(campaign.status), fontSize: 10 }}>
                            {campaign.status}
                          </Text>
                        </Badge>
                      </View>
                      <Text style={styles.campaignReach}>{campaign.reach}</Text>
                    </View>
                    <Text style={styles.campaignName}>{campaign.name}</Text>
                    <View style={styles.campaignFooter}>
                      <Text style={styles.campaignBudget}>Budget: {campaign.budget}</Text>
                      <Text style={styles.campaignPlatform}>{campaign.platform}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Agency Tools */}
        <Card style={styles.actionsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Agency Tools</Text>
          </View>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButtonPrimary}
              onPress={() => navigation.navigate('Promotions')}
            >
              <LinearGradient
                colors={gradients.primary.colors}
                start={gradients.primary.start}
                end={gradients.primary.end}
                style={styles.actionGradient}
              >
                <Text style={styles.actionTextPrimary}>Create Campaign</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => {}}
            >
              <Text style={styles.actionTextSecondary}>Manage Campaigns</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => {}}
            >
              <Text style={styles.actionTextSecondary}>Manage Clients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Text style={styles.actionTextSecondary}>View Analytics</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => {}}
          >
            <Text style={styles.actionTextSecondary}>Client Analytics</Text>
          </TouchableOpacity>
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
  campaignsCard: {
    borderRadius: 20,
    padding: 16,
  },
  cardHeader: {
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
  campaignList: {
    gap: 12,
  },
  campaignItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  campaignIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  campaignInfo: {
    flex: 1,
  },
  campaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  campaignTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  campaignArtist: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.cardForeground,
  },
  campaignReach: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  campaignName: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  campaignFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  campaignBudget: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  campaignPlatform: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.cardForeground,
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
  bottomSpacer: {
    height: 100,
  },
});

export default AgencyDashboardScreen;
