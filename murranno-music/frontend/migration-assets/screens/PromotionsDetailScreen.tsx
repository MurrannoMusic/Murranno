import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  duration?: string;
  features: string[];
  imageUrl?: string;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  services: string[];
  tier: number;
  imageUrl?: string;
}

const PromotionsDetailScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'bundles'>('services');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'social', 'streaming', 'press', 'video'];

  const services: Service[] = [
    {
      id: '1',
      name: 'Instagram Promotion',
      description: 'Boost your music on Instagram with targeted ads and influencer shoutouts',
      price: 25000,
      category: 'social',
      duration: '7 days',
      features: ['10K+ Reach', 'Story Mentions', 'Feed Posts', 'Analytics Report'],
    },
    {
      id: '2',
      name: 'Spotify Playlist Pitching',
      description: 'Get your track pitched to curated Spotify playlists',
      price: 35000,
      category: 'streaming',
      duration: '14 days',
      features: ['5 Playlist Pitches', 'Curator Outreach', 'Placement Report', 'Stream Tracking'],
    },
    {
      id: '3',
      name: 'TikTok Campaign',
      description: 'Viral TikTok promotion with trending creators',
      price: 45000,
      category: 'social',
      duration: '7 days',
      features: ['5 Creator Videos', 'Sound Usage Rights', 'Viral Potential', 'Engagement Report'],
    },
    {
      id: '4',
      name: 'Music Blog Feature',
      description: 'Get featured on top music blogs and publications',
      price: 20000,
      category: 'press',
      duration: '3 days',
      features: ['3 Blog Features', 'SEO Optimized', 'Permanent Links', 'Social Shares'],
    },
    {
      id: '5',
      name: 'YouTube Promotion',
      description: 'Boost your music video views and engagement',
      price: 40000,
      category: 'video',
      duration: '14 days',
      features: ['10K+ Views', 'Ad Campaign', 'Subscriber Growth', 'Analytics'],
    },
  ];

  const bundles: Bundle[] = [
    {
      id: 'b1',
      name: 'Starter Pack',
      description: 'Perfect for new artists looking to build their presence',
      price: 50000,
      originalPrice: 70000,
      tier: 1,
      services: ['Instagram Promotion', 'Spotify Playlist Pitching'],
    },
    {
      id: 'b2',
      name: 'Growth Bundle',
      description: 'Comprehensive promotion for growing artists',
      price: 120000,
      originalPrice: 165000,
      tier: 2,
      services: ['Instagram Promotion', 'TikTok Campaign', 'Spotify Playlist Pitching', 'Music Blog Feature'],
    },
    {
      id: 'b3',
      name: 'Premium Package',
      description: 'Full-scale promotion for serious artists',
      price: 250000,
      originalPrice: 340000,
      tier: 3,
      services: ['All Services Included', '30-Day Duration', 'Dedicated Manager', 'Priority Support'],
    },
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const renderServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
    >
      <View style={styles.serviceHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </Text>
        </View>
        {item.duration && (
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.serviceName}>{item.name}</Text>
      <Text style={styles.serviceDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.featuresRow}>
        {item.features.slice(0, 2).map((feature, index) => (
          <View key={index} style={styles.featureChip}>
            <Ionicons name="checkmark" size={12} color={colors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        {item.features.length > 2 && (
          <Text style={styles.moreFeatures}>+{item.features.length - 2} more</Text>
        )}
      </View>

      <View style={styles.serviceFooter}>
        <Text style={styles.servicePrice}>{formatCurrency(item.price)}</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderBundleCard = ({ item }: { item: Bundle }) => {
    const discount = Math.round((1 - item.price / item.originalPrice) * 100);
    
    return (
      <TouchableOpacity 
        style={styles.bundleCard}
        onPress={() => navigation.navigate('BundleDetail', { bundleId: item.id })}
      >
        <LinearGradient
          colors={
            item.tier === 3 
              ? [colors.primary, colors.secondary]
              : item.tier === 2
              ? [colors.secondary, colors.accent]
              : [colors.card, colors.muted]
          }
          style={styles.bundleGradient}
        >
          {item.tier === 3 && (
            <View style={styles.popularBadge}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.popularText}>Most Popular</Text>
            </View>
          )}
          
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>Save {discount}%</Text>
          </View>

          <Text style={[styles.bundleName, item.tier >= 2 && { color: '#FFFFFF' }]}>
            {item.name}
          </Text>
          <Text style={[styles.bundleDescription, item.tier >= 2 && { color: 'rgba(255,255,255,0.8)' }]}>
            {item.description}
          </Text>

          <View style={styles.bundleServices}>
            {item.services.slice(0, 3).map((service, index) => (
              <View key={index} style={styles.bundleServiceItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={16} 
                  color={item.tier >= 2 ? '#FFFFFF' : colors.success} 
                />
                <Text style={[styles.bundleServiceText, item.tier >= 2 && { color: '#FFFFFF' }]}>
                  {service}
                </Text>
              </View>
            ))}
            {item.services.length > 3 && (
              <Text style={[styles.moreServices, item.tier >= 2 && { color: 'rgba(255,255,255,0.7)' }]}>
                +{item.services.length - 3} more services
              </Text>
            )}
          </View>

          <View style={styles.bundlePricing}>
            <Text style={[styles.originalPrice, item.tier >= 2 && { color: 'rgba(255,255,255,0.6)' }]}>
              {formatCurrency(item.originalPrice)}
            </Text>
            <Text style={[styles.bundlePrice, item.tier >= 2 && { color: '#FFFFFF' }]}>
              {formatCurrency(item.price)}
            </Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.bundleButton, 
              item.tier >= 2 && { backgroundColor: '#FFFFFF' }
            ]}
          >
            <Text style={[
              styles.bundleButtonText,
              item.tier >= 2 && { color: colors.primary }
            ]}>
              Get Started
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color={colors.foreground} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <LinearGradient
        colors={[colors.primary + '30', colors.secondary + '20']}
        style={styles.heroSection}
      >
        <Ionicons name="megaphone" size={40} color={colors.primary} />
        <Text style={styles.heroTitle}>Boost Your Music</Text>
        <Text style={styles.heroSubtitle}>
          Professional promotion services to grow your audience
        </Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'services' && styles.tabActive]}
          onPress={() => setActiveTab('services')}
        >
          <Text style={[styles.tabText, activeTab === 'services' && styles.tabTextActive]}>
            Services
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bundles' && styles.tabActive]}
          onPress={() => setActiveTab('bundles')}
        >
          <Text style={[styles.tabText, activeTab === 'bundles' && styles.tabTextActive]}>
            Bundles
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'services' && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryPill,
                selectedCategory === category && styles.categoryPillActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryPillText,
                selectedCategory === category && styles.categoryPillTextActive
              ]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'services' ? (
          <FlatList
            data={filteredServices}
            renderItem={renderServiceCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <FlatList
            data={bundles}
            renderItem={renderBundleCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ScrollView>
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
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
  heroSection: {
    marginHorizontal: spacing.lg,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: colors.primaryForeground,
  },
  categoryScroll: {
    marginBottom: spacing.md,
  },
  categoryContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: colors.primaryForeground,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  serviceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: colors.mutedForeground,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featureText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '500',
  },
  moreFeatures: {
    fontSize: 11,
    color: colors.mutedForeground,
    alignSelf: 'center',
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bundleCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  bundleGradient: {
    padding: spacing.lg,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: spacing.sm,
  },
  popularText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bundleName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 4,
  },
  bundleDescription: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
  },
  bundleServices: {
    marginBottom: spacing.md,
  },
  bundleServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  bundleServiceText: {
    fontSize: 14,
    color: colors.foreground,
  },
  moreServices: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  bundlePricing: {
    marginBottom: spacing.md,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.mutedForeground,
    textDecorationLine: 'line-through',
  },
  bundlePrice: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
  },
  bundleButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  bundleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
});

export default PromotionsDetailScreen;
