/**
 * Utility Styles for React Native
 * Mirrors web CSS component classes from index.css
 * 
 * These are pre-composed style objects that match the web utility classes
 */

import { StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { colors } from './colors';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';

// Modern Card System - matches .modern-card
export const modernCard: ViewStyle = {
  backgroundColor: 'rgba(14, 21, 36, 0.8)', // card/80
  borderWidth: 1,
  borderColor: 'rgba(30, 41, 59, 0.3)', // border/30
  borderRadius: 24, // rounded-3xl
  padding: spacing[4],
  ...shadows.primary,
};

// Stat Card - matches .stat-card
export const statCard: ViewStyle = {
  backgroundColor: 'rgba(14, 21, 36, 0.9)', // card/90
  borderWidth: 1,
  borderColor: 'rgba(30, 41, 59, 0.2)', // border/20
  borderRadius: 16, // rounded-2xl
  padding: spacing[4],
  ...shadows.soft,
};

// Glass Card - matches .glass-card
export const glassCard: ViewStyle = {
  backgroundColor: 'rgba(14, 21, 36, 0.4)', // card/40
  borderWidth: 1,
  borderColor: 'rgba(30, 41, 59, 0.2)', // border/20
  borderRadius: 24, // rounded-3xl
  padding: spacing[6],
  ...shadows.soft,
};

// Glass Nav - matches .glass-nav
export const glassNav: ViewStyle = {
  backgroundColor: 'rgba(8, 12, 21, 0.8)', // background/80
  borderTopWidth: 1,
  borderTopColor: 'rgba(30, 41, 59, 0.2)', // border/20
};

// Pill Button - matches .pill-button
export const pillButton: ViewStyle = {
  backgroundColor: colors.primary.DEFAULT,
  paddingHorizontal: spacing[8],
  paddingVertical: spacing[4],
  borderRadius: 9999, // rounded-full
  ...shadows.primary,
};

export const pillButtonText: TextStyle = {
  color: colors.primary.foreground,
  fontFamily: typography.fontFamily.sans,
  fontWeight: '600',
  fontSize: typography.fontSize.sm,
};

// Ghost Button - matches .ghost-button
export const ghostButton: ViewStyle = {
  backgroundColor: 'rgba(30, 41, 59, 0.3)', // secondary/30
  paddingHorizontal: spacing[6],
  paddingVertical: spacing[3],
  borderRadius: 16, // rounded-2xl
  borderWidth: 1,
  borderColor: 'rgba(30, 41, 59, 0.3)', // border/30
};

export const ghostButtonText: TextStyle = {
  color: colors.secondary.foreground,
  fontFamily: typography.fontFamily.sans,
  fontWeight: '500',
  fontSize: typography.fontSize.sm,
};

// FAB - matches .fab
export const fab: ViewStyle = {
  position: 'absolute',
  bottom: 96, // bottom-24
  right: 24, // right-6
  backgroundColor: colors.accent.DEFAULT,
  padding: spacing[4],
  borderRadius: 9999,
  ...shadows.accent,
  zIndex: 50,
};

// Typography Utilities
export const headingXl: TextStyle = {
  fontSize: typography.fontSize['3xl'],
  fontFamily: typography.fontFamily.sans,
  fontWeight: '700',
  letterSpacing: -0.5,
  color: colors.foreground,
};

export const headingLg: TextStyle = {
  fontSize: typography.fontSize['2xl'],
  fontFamily: typography.fontFamily.sans,
  fontWeight: '700',
  letterSpacing: -0.5,
  color: colors.foreground,
};

export const headingMd: TextStyle = {
  fontSize: typography.fontSize.xl,
  fontFamily: typography.fontFamily.sans,
  fontWeight: '600',
  color: colors.foreground,
};

export const bodyLg: TextStyle = {
  fontSize: typography.fontSize.base,
  fontFamily: typography.fontFamily.sans,
  fontWeight: '500',
  color: 'rgba(248, 250, 252, 0.9)', // foreground/90
};

export const bodyMd: TextStyle = {
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.sans,
  fontWeight: '500',
  color: 'rgba(248, 250, 252, 0.8)', // foreground/80
};

export const bodySm: TextStyle = {
  fontSize: typography.fontSize.xs,
  fontFamily: typography.fontFamily.sans,
  fontWeight: '500',
  color: colors.muted.foreground,
};

// Nav Item - matches .nav-item
export const navItem: ViewStyle = {
  flexDirection: 'column',
  alignItems: 'center',
  gap: 6,
  padding: spacing[3],
  borderRadius: 16,
};

export const navItemActive: ViewStyle = {
  ...navItem,
  backgroundColor: 'rgba(124, 58, 237, 0.15)', // primary/15
  ...shadows.soft,
};

// Pill Tab - matches .pill-tab
export const pillTab: ViewStyle = {
  paddingHorizontal: spacing[4],
  paddingVertical: spacing[2],
  borderRadius: 9999,
};

export const pillTabActive: ViewStyle = {
  ...pillTab,
  backgroundColor: colors.primary.DEFAULT,
  ...shadows.primary,
};

export const pillTabInactive: ViewStyle = {
  ...pillTab,
  backgroundColor: 'transparent',
};

export const pillTabActiveText: TextStyle = {
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.sans,
  fontWeight: '500',
  color: colors.primary.foreground,
};

export const pillTabInactiveText: TextStyle = {
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.sans,
  fontWeight: '500',
  color: colors.muted.foreground,
};

// List Item - matches .list-item
export const listItem: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing[4],
  padding: spacing[4],
  borderRadius: 16,
};

// Portfolio styles
export const portfolioValue: TextStyle = {
  fontSize: typography.fontSize['4xl'],
  fontFamily: typography.fontFamily.sans,
  fontWeight: '700',
  // Note: gradient text requires special handling in RN
  color: colors.primary.DEFAULT,
};

export const portfolioChangePositive: TextStyle = {
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.sans,
  fontWeight: '600',
  color: colors.success.DEFAULT,
};

export const portfolioChangeNegative: TextStyle = {
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.sans,
  fontWeight: '600',
  color: colors.destructive.DEFAULT,
};

// Safe area padding
export const mobileSafeBottom: ViewStyle = {
  paddingBottom: 80, // pb-20
};

export const mobileSafeTop: ViewStyle = {
  paddingTop: 32, // pt-8
};

// Mobile container
export const mobileContainer: ViewStyle = {
  width: '100%',
  paddingHorizontal: spacing[4],
};

// Create StyleSheet for performance
export const utilityStyles = StyleSheet.create({
  modernCard,
  statCard,
  glassCard,
  glassNav,
  pillButton,
  ghostButton,
  fab,
  navItem,
  navItemActive,
  pillTab,
  pillTabActive,
  pillTabInactive,
  listItem,
  mobileSafeBottom,
  mobileSafeTop,
  mobileContainer,
});

export const textStyles = StyleSheet.create({
  headingXl,
  headingLg,
  headingMd,
  bodyLg,
  bodyMd,
  bodySm,
  pillButtonText,
  ghostButtonText,
  pillTabActiveText,
  pillTabInactiveText,
  portfolioValue,
  portfolioChangePositive,
  portfolioChangeNegative,
});

export default {
  utilityStyles,
  textStyles,
};
