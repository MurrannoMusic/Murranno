/**
 * Welcome Screen - React Native
 * Matches the web Welcome page with carousel and user type selection
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Music, Users, Briefcase, Check } from 'lucide-react-native';
import { colors, gradients } from '../theme/colors';
import { shadows } from '../theme/shadows';
import { spacing, borderRadius } from '../theme/spacing';
import { textStyles, fontSize, fontWeight } from '../theme/typography';
import { spring } from '../theme/animations';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const { width } = Dimensions.get('window');

// Carousel data
const carouselItems = [
  {
    id: '1',
    image: require('../assets/carousel-1.jpg'),
    title: 'Distribute Your Music',
    description: 'Get your music on Spotify, Apple Music, and 150+ platforms worldwide.',
  },
  {
    id: '2',
    image: require('../assets/carousel-2.jpg'),
    title: 'Grow Your Audience',
    description: 'Powerful promotional tools to reach millions of listeners.',
  },
  {
    id: '3',
    image: require('../assets/carousel-3.jpg'),
    title: 'Earn More',
    description: 'Keep 100% of your royalties and get paid monthly.',
  },
];

// User types
const userTypes = [
  {
    id: 'artist',
    label: 'Artist',
    icon: Music,
    description: 'Distribute and promote your music',
    color: colors.dark.primary,
  },
  {
    id: 'label',
    label: 'Label',
    icon: Users,
    description: 'Manage multiple artists',
    color: colors.dark.accent,
  },
  {
    id: 'agency',
    label: 'Agency',
    icon: Briefcase,
    description: 'Run promotion campaigns',
    color: colors.dark.success,
  },
];

interface WelcomeScreenProps {
  onGetStarted: (userType: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const drawerAnim = useRef(new Animated.Value(0)).current;

  const handleScroll = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  }, []);

  const openTypeSelection = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowTypeSelection(true);
    Animated.spring(drawerAnim, {
      toValue: 1,
      ...spring.bouncy,
    }).start();
  }, [drawerAnim]);

  const closeTypeSelection = useCallback(() => {
    Animated.spring(drawerAnim, {
      toValue: 0,
      ...spring.default,
    }).start(() => {
      setShowTypeSelection(false);
      setSelectedType(null);
    });
  }, [drawerAnim]);

  const handleTypeSelect = useCallback((typeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(typeId);
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedType) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onGetStarted(selectedType);
    }
  }, [selectedType, onGetStarted]);

  const drawerTranslateY = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const overlayOpacity = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Gradient background */}
      <LinearGradient
        colors={gradients.mesh.colors as any}
        locations={gradients.mesh.locations}
        start={gradients.mesh.start}
        end={gradients.mesh.end}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Carousel */}
      <View style={[styles.carouselContainer, { paddingTop: insets.top }]}>
        <FlatList
          ref={flatListRef}
          data={carouselItems}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.carouselItem}>
              <Image source={item.image} style={styles.carouselImage} />
              <View style={styles.carouselContent}>
                <Text style={styles.carouselTitle}>{item.title}</Text>
                <Text style={styles.carouselDescription}>{item.description}</Text>
              </View>
            </View>
          )}
        />

        {/* Pagination dots */}
        <View style={styles.pagination}>
          {carouselItems.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentIndex === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Fixed bottom button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing[4] }]}>
        <Button variant="pill" size="lg" onPress={openTypeSelection}>
          Get Started
        </Button>
      </View>

      {/* Type selection drawer */}
      {showTypeSelection && (
        <>
          {/* Overlay */}
          <Animated.View
            style={[styles.overlay, { opacity: overlayOpacity }]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={closeTypeSelection}
              activeOpacity={1}
            />
          </Animated.View>

          {/* Drawer */}
          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [{ translateY: drawerTranslateY }],
                paddingBottom: insets.bottom + spacing[4],
              },
            ]}
          >
            <View style={styles.drawerHandle} />
            
            <Text style={styles.drawerTitle}>Select Account Type</Text>
            <Text style={styles.drawerSubtitle}>
              Choose how you want to use Murranno Music
            </Text>

            {/* User type cards */}
            <View style={styles.typeCards}>
              {userTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;

                return (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => handleTypeSelect(type.id)}
                    activeOpacity={0.8}
                  >
                    <Card
                      style={[
                        styles.typeCard,
                        isSelected && {
                          borderColor: type.color,
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <View style={styles.typeCardContent}>
                        <View
                          style={[
                            styles.typeIconContainer,
                            { backgroundColor: `${type.color}20` },
                          ]}
                        >
                          <Icon size={24} color={type.color} />
                        </View>
                        <View style={styles.typeInfo}>
                          <Text style={styles.typeLabel}>{type.label}</Text>
                          <Text style={styles.typeDescription}>
                            {type.description}
                          </Text>
                        </View>
                        {isSelected && (
                          <View
                            style={[
                              styles.checkContainer,
                              { backgroundColor: type.color },
                            ]}
                          >
                            <Check size={16} color="white" />
                          </View>
                        )}
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Continue button */}
            <Button
              variant="pill"
              size="lg"
              disabled={!selectedType}
              onPress={handleContinue}
              style={styles.continueButton}
            >
              Continue
            </Button>
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  carouselContainer: {
    flex: 1,
  },
  carouselItem: {
    width,
    flex: 1,
  },
  carouselImage: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
  },
  carouselContent: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    alignItems: 'center',
  },
  carouselTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.dark.foreground,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  carouselDescription: {
    fontSize: fontSize.lg,
    color: colors.dark.mutedForeground,
    textAlign: 'center',
    lineHeight: 26,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[6],
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dark.muted,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: colors.dark.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[6],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.dark.card,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    zIndex: 20,
    ...shadows.secondary,
  },
  drawerHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.dark.muted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing[6],
  },
  drawerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.dark.foreground,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  drawerSubtitle: {
    fontSize: fontSize.base,
    color: colors.dark.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  typeCards: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  typeCard: {
    padding: spacing[4],
  },
  typeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },
  typeLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.dark.foreground,
    marginBottom: spacing[0.5],
  },
  typeDescription: {
    fontSize: fontSize.sm,
    color: colors.dark.mutedForeground,
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    width: '100%',
  },
});

export default WelcomeScreen;
