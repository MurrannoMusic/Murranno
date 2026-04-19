/**
 * UserTypeSelectionScreen - React Native
 * Matches src/pages/UserTypeSelection.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { useToast } from '../hooks/useToast';
import { colors } from '../theme/colors';
import { gradients } from '../theme/gradients';
import Card from '../components/ui/Card';

type UserType = 'artist' | 'label' | 'agency';

interface UserTypeOption {
  id: UserType;
  title: string;
  description: string;
  icon: string;
  features: string[];
  gradient: any;
}

const userTypeOptions: UserTypeOption[] = [
  {
    id: 'artist',
    title: 'Artist',
    description: 'Independent musicians managing their own career',
    icon: 'musical-notes',
    features: [
      'Upload & distribute music',
      'Track streaming analytics',
      'Manage earnings',
      'Run promo campaigns',
    ],
    gradient: gradients.primary,
  },
  {
    id: 'label',
    title: 'Label',
    description: 'Record labels managing multiple artists',
    icon: 'disc',
    features: [
      'Manage artist roster',
      'Aggregate analytics',
      'Split earnings',
      'Bulk releases',
    ],
    gradient: gradients.secondary,
  },
  {
    id: 'agency',
    title: 'Agency',
    description: 'Marketing agencies running campaigns',
    icon: 'megaphone',
    features: [
      'Manage campaigns',
      'Track performance',
      'Client reporting',
      'Bulk promotions',
    ],
    gradient: gradients.accent,
  },
];

const UserTypeSelectionScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedType) {
      showToast('Please select a user type', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Save user type preference to backend
      showToast(`Welcome as ${selectedType}!`, 'success');
      
      // Navigate to appropriate dashboard
      switch (selectedType) {
        case 'artist':
          navigation.navigate('ArtistDashboard');
          break;
        case 'label':
          navigation.navigate('LabelDashboard');
          break;
        case 'agency':
          navigation.navigate('AgencyDashboard');
          break;
      }
    } catch (error) {
      showToast('Failed to save preference', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/mm_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Choose Your Path</Text>
          <Text style={styles.subtitle}>
            Select how you'll be using Murranno Music
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {userTypeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setSelectedType(option.id)}
              activeOpacity={0.8}
            >
              <Card
                style={[
                  styles.optionCard,
                  selectedType === option.id && styles.optionCardSelected,
                ]}
              >
                <View style={styles.cardContent}>
                  {/* Icon & Selection Indicator */}
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.iconContainer,
                        selectedType === option.id && styles.iconContainerSelected,
                      ]}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={28}
                        color={selectedType === option.id ? colors.white : colors.primary}
                      />
                    </View>
                    {selectedType === option.id && (
                      <View style={styles.checkContainer}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                      </View>
                    )}
                  </View>

                  {/* Title & Description */}
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>

                  {/* Features */}
                  <View style={styles.featuresContainer}>
                    {option.features.map((feature, index) => (
                      <View key={index} style={styles.featureRow}>
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.success}
                        />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Selected Border Gradient */}
                {selectedType === option.id && (
                  <LinearGradient
                    colors={option.gradient.colors}
                    start={option.gradient.start}
                    end={option.gradient.end}
                    style={styles.selectedBorder}
                  />
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedType && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedType || isLoading}
        >
          <LinearGradient
            colors={selectedType ? gradients.primary.colors : ['#4B5563', '#374151']}
            start={gradients.primary.start}
            end={gradients.primary.end}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>
              {isLoading ? 'Setting up...' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Skip for now */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('ArtistDashboard')}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

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
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  logo: {
    height: 40,
    width: 120,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: 8,
  },
  cardsContainer: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: colors.primary,
  },
  checkContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cardForeground,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: colors.cardForeground,
  },
  selectedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  continueButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  skipButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default UserTypeSelectionScreen;
