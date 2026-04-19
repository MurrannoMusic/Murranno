import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Tab {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
  variant?: 'default' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onValueChange,
  style,
  variant = 'default',
}) => {
  const [tabWidths, setTabWidths] = useState<{ [key: string]: number }>({});
  const [tabPositions, setTabPositions] = useState<{ [key: string]: number }>({});
  const translateX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  const handleTabLayout = (tabValue: string, event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    setTabWidths((prev) => ({ ...prev, [tabValue]: width }));
    setTabPositions((prev) => ({ ...prev, [tabValue]: x }));
  };

  useEffect(() => {
    if (tabPositions[value] !== undefined && tabWidths[value] !== undefined) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: tabPositions[value],
          useNativeDriver: true,
          tension: 300,
          friction: 25,
        }),
        Animated.spring(indicatorWidth, {
          toValue: tabWidths[value],
          useNativeDriver: false,
          tension: 300,
          friction: 25,
        }),
      ]).start();
    }
  }, [value, tabPositions, tabWidths]);

  const handlePress = (tabValue: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(tabValue);
  };

  if (variant === 'pills') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.pillsContainer, style]}
      >
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          return (
            <TouchableOpacity
              key={tab.value}
              activeOpacity={0.7}
              onPress={() => handlePress(tab.value)}
              style={[styles.pill, isActive && styles.pillActive]}
            >
              {tab.icon}
              <Text
                style={[
                  styles.pillText,
                  isActive && styles.pillTextActive,
                  tab.icon && { marginLeft: spacing[1.5] },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.tabsWrapper}>
        {tabs.map((tab) => {
          const isActive = tab.value === value;
          return (
            <TouchableOpacity
              key={tab.value}
              activeOpacity={0.7}
              onPress={() => handlePress(tab.value)}
              onLayout={(e) => handleTabLayout(tab.value, e)}
              style={styles.tab}
            >
              {tab.icon}
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                  tab.icon && { marginLeft: spacing[1.5] },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    padding: spacing[1],
  },
  tabsWrapper: {
    flexDirection: 'row',
    position: 'relative',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    zIndex: 1,
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: colors.foreground,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    top: 0,
    backgroundColor: colors.background,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[1],
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 9999,
    backgroundColor: colors.secondary,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.mutedForeground,
  },
  pillTextActive: {
    color: colors.primaryForeground,
  },
});

export default Tabs;
