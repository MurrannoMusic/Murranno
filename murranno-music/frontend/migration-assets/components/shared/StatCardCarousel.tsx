/**
 * StatCardCarousel - React Native
 * Horizontal scrolling analytics cards
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { gradients } from '../../theme/gradients';

interface StatItem {
  id: string;
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon?: string;
}

interface StatCardCarouselProps {
  title?: string;
  items: StatItem[];
}

const StatCardCarousel: React.FC<StatCardCarouselProps> = ({ title, items }) => {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => (
          <View key={item.id} style={styles.card}>
            <LinearGradient
              colors={
                index % 3 === 0
                  ? gradients.cardOverlay.colors
                  : index % 3 === 1
                  ? gradients.accent.colors
                  : gradients.secondary.colors
              }
              style={styles.cardGradient}
            >
              {/* Header */}
              <View style={styles.cardHeader}>
                {item.icon && (
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={colors.white}
                    />
                  </View>
                )}
                {item.change && (
                  <View
                    style={[
                      styles.changeContainer,
                      item.isPositive ? styles.changePositive : styles.changeNegative,
                    ]}
                  >
                    <Ionicons
                      name={item.isPositive ? 'trending-up' : 'trending-down'}
                      size={12}
                      color={item.isPositive ? colors.success : colors.destructive}
                    />
                    <Text
                      style={[
                        styles.changeText,
                        item.isPositive ? styles.changeTextPositive : styles.changeTextNegative,
                      ]}
                    >
                      {item.change}
                    </Text>
                  </View>
                )}
              </View>

              {/* Value */}
              <Text style={styles.value}>{item.value}</Text>
              
              {/* Title */}
              <Text style={styles.itemTitle}>{item.title}</Text>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.cardForeground,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scrollContent: {
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  card: {
    width: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changePositive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  changeNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  changeTextPositive: {
    color: colors.success,
  },
  changeTextNegative: {
    color: colors.destructive,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default StatCardCarousel;
