/**
 * Page Container Component - React Native
 * Matches the web PageContainer and layout components
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../../theme/colors';
import { spacing, componentSpacing } from '../../theme/spacing';

interface PageContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  hasBottomNav?: boolean;
  hasHeader?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  useMeshBackground?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  scrollable = true,
  hasBottomNav = true,
  hasHeader = true,
  style,
  contentStyle,
  refreshing = false,
  onRefresh,
  useMeshBackground = true,
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    paddingBottom: hasBottomNav ? componentSpacing.bottomNavHeight + insets.bottom : 0,
  };

  const contentContainerStyle: ViewStyle = {
    padding: spacing[4],
    paddingTop: hasHeader ? spacing[2] : insets.top + spacing[4],
    ...contentStyle,
  };

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.dark.primary}
            colors={[colors.dark.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContainer, contentContainerStyle]}>{children}</View>
  );

  if (useMeshBackground) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.dark.background} />
        
        {/* Mesh gradient background */}
        <LinearGradient
          colors={gradients.mesh.colors as any}
          locations={gradients.mesh.locations}
          start={gradients.mesh.start}
          end={gradients.mesh.end}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Primary glow overlay */}
        <View style={styles.glowOverlay} />
        
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle, { backgroundColor: colors.dark.background }, style]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark.background} />
      {content}
    </View>
  );
};

// Header component for pages
interface PageHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + spacing[2],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  staticContainer: {
    flex: 1,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    backgroundColor: 'transparent',
  },
});

export default PageContainer;
