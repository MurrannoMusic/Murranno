/**
 * FilterPills - React Native
 * Horizontal scrolling filter chips
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface FilterOption {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

interface FilterPillsProps {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  showAllOption?: boolean;
  allLabel?: string;
  style?: ViewStyle;
}

const FilterPills: React.FC<FilterPillsProps> = ({
  options,
  selectedId,
  onSelect,
  showAllOption = true,
  allLabel = 'All',
  style,
}) => {
  const allOptions: FilterOption[] = showAllOption
    ? [{ id: 'all', label: allLabel }, ...options]
    : options;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {allOptions.map((option) => {
        const isSelected = selectedId === option.id;
        
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.7}
          >
            {option.icon && (
              <Ionicons
                name={option.icon as any}
                size={16}
                color={isSelected ? colors.white : colors.foreground}
              />
            )}
            <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
              {option.label}
            </Text>
            {option.count !== undefined && (
              <View style={[styles.countBadge, isSelected && styles.countBadgeSelected]}>
                <Text style={[styles.countText, isSelected && styles.countTextSelected]}>
                  {option.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
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
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  pillTextSelected: {
    color: colors.white,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  countTextSelected: {
    color: colors.white,
  },
});

export default FilterPills;
