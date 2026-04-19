import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { gradients } from '../theme/gradients';
import { Button } from '../components/ui/Button';

const NotFoundScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigateTo, goBack, canGoBack } = useAppNavigation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.mesh.colors as any}
        locations={gradients.mesh.locations}
        start={gradients.mesh.start}
        end={gradients.mesh.end}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + spacing[8] }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle-outline" size={80} color={colors.mutedForeground} />
        </View>

        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Page Not Found</Text>
        <Text style={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </Text>

        <View style={styles.actions}>
          {canGoBack() && (
            <Button variant="outline" onPress={goBack} style={styles.button}>
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
              <Text style={styles.buttonText}>Go Back</Text>
            </Button>
          )}
          
          <Button variant="default" onPress={() => navigateTo.artistDashboard()} style={styles.button}>
            <Ionicons name="home" size={20} color={colors.primaryForeground} />
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
              Go Home
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.muted}50`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 64,
    fontFamily: typography.fontFamily.bold,
    color: colors.foreground,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.semibold,
    color: colors.foreground,
    marginBottom: spacing[4],
  },
  description: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing[8],
    maxWidth: 300,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  buttonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.foreground,
  },
});

export default NotFoundScreen;
