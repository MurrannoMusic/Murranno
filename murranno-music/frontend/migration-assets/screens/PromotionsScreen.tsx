import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
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
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { useAppNavigation } from '../hooks/useAppNavigation';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
}

const PromotionsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigateTo } = useAppNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<string[]>([]);

  // Mock data - replace with actual hook
  const services: Service[] = [
    {
      id: '1',
      name: 'Spotify Playlist Placement',
      description: 'Get your track featured on curated playlists',
      price: 15000,
      category: 'playlist',
      image: null,
    },
    {
      id: '2',
      name: 'Instagram Promo',
      description: 'Reach new fans through targeted social campaigns',
      price: 25000,
      category: 'social',
      image: null,
    },
    {
      id: '3',
      name: 'TikTok Campaign',
      description: 'Viral marketing on TikTok',
      price: 35000,
      category: 'social',
      image: null,
    },
    {
      id: '4',
      name: 'Blog Feature',
      description: 'Get featured on popular music blogs',
      price: 20000,
      category: 'press',
      image: null,
    },
  ];

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'playlist', label: 'Playlists' },
    { value: 'social', label: 'Social' },
    { value: 'press', label: 'Press' },
  ];

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(s => s.category === activeCategory);

  const cartTotal = cart.reduce((sum, id) => {
    const service = services.find(s => s.id === id);
    return sum + (service?.price || 0);
  }, 0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const toggleCart = (id: string) => {
    setCart(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const renderServiceItem = ({ item }: { item: Service }) => {
    const isInCart = cart.includes(item.id);

    return (
      <Card style={styles.serviceCard}>
        <CardContent style={styles.serviceContent}>
          <View style={styles.serviceImage}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.serviceImageContent} />
            ) : (
              <View style={styles.servicePlaceholder}>
                <Ionicons name="megaphone" size={24} color={colors.primary} />
              </View>
            )}
          </View>
          
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.serviceDescription} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.servicePrice}>{formatCurrency(item.price)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, isInCart && styles.addButtonActive]}
            onPress={() => toggleCart(item.id)}
          >
            <Ionicons
              name={isInCart ? 'checkmark' : 'add'}
              size={20}
              color={isInCart ? colors.primaryForeground : colors.primary}
            />
          </TouchableOpacity>
        </CardContent>
      </Card>
    );
  };

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
            <Ionicons name="megaphone" size={12} color={colors.primary} style={{ marginRight: 4 }} />
            PROMOTIONS
          </Badge>

          <TouchableOpacity onPress={() => navigateTo.profile()} style={styles.avatar}>
            <Ionicons name="person" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </BlurView>

      <View style={[styles.content, { paddingTop: insets.top + 70 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Promote Your Music</Text>
          <Text style={styles.headerSubtitle}>Reach more fans with our marketing services</Text>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Tabs
            tabs={categories}
            value={activeCategory}
            onValueChange={setActiveCategory}
            variant="pills"
          />
        </View>

        {/* Services List */}
        <FlatList
          data={filteredServices}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: cart.length > 0 ? insets.bottom + 160 : insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      </View>

      {/* Cart Bar */}
      {cart.length > 0 && (
        <BlurView
          intensity={90}
          tint="dark"
          style={[styles.cartBar, { paddingBottom: insets.bottom + spacing[2] }]}
        >
          <View style={styles.cartContent}>
            <View style={styles.cartInfo}>
              <Text style={styles.cartItems}>{cart.length} item{cart.length !== 1 ? 's' : ''}</Text>
              <Text style={styles.cartTotal}>{formatCurrency(cartTotal)}</Text>
            </View>
            <Button
              variant="default"
              size="lg"
              style={styles.checkoutButton}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
            </Button>
          </View>
        </BlurView>
      )}
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
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
    marginTop: spacing[1],
  },
  categoriesContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  listContent: {
    paddingHorizontal: spacing[4],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  serviceCard: {
    width: '48%',
  },
  serviceContent: {
    padding: spacing[3],
  },
  serviceImage: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing[3],
  },
  serviceImageContent: {
    width: '100%',
    height: '100%',
  },
  servicePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.foreground,
  },
  serviceDescription: {
    fontSize: typography.fontSizes.xs,
    color: colors.mutedForeground,
    marginTop: spacing[1],
    lineHeight: 16,
  },
  servicePrice: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginTop: spacing[2],
  },
  addButton: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonActive: {
    backgroundColor: colors.primary,
  },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  cartInfo: {
    flex: 1,
  },
  cartItems: {
    fontSize: typography.fontSizes.sm,
    color: colors.mutedForeground,
  },
  cartTotal: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  checkoutButtonText: {
    color: colors.primaryForeground,
    fontFamily: typography.fontFamily.semibold,
  },
});

export default PromotionsScreen;
