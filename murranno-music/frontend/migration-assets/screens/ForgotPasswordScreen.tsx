/**
 * ForgotPasswordScreen - React Native
 * Matches src/pages/ForgotPassword.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { colors } from '../theme/colors';
import { gradients } from '../theme/gradients';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const { resetPasswordForEmail } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      showToast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPasswordForEmail(email);
      if (!error) {
        setEmailSent(true);
        showToast('Reset link sent!', 'success');
      }
    } catch (error) {
      showToast('Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/musician-background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.spacer} />

          {/* Card */}
          <BlurView intensity={40} tint="dark" style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Reset your password</Text>
              <Text style={styles.subtitle}>
                {emailSent
                  ? 'Check your email for reset instructions'
                  : 'Enter your email to receive a password reset link'}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              {emailSent ? (
                <View style={styles.successContainer}>
                  <View style={styles.successIconContainer}>
                    <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                  </View>
                  <Text style={styles.successText}>
                    We've sent a password reset link to{' '}
                    <Text style={styles.emailHighlight}>{email}</Text>
                  </Text>
                  <Text style={styles.successSubtext}>
                    Please check your email and click the link to reset your password.
                  </Text>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <LinearGradient
                      colors={gradients.primary.colors}
                      start={gradients.primary.start}
                      end={gradients.primary.end}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.buttonText}>Back to Login</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.white50}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={gradients.primary.colors}
                      start={gradients.primary.start}
                      end={gradients.primary.end}
                      style={styles.gradientButton}
                    >
                      {loading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color={colors.white} size="small" />
                          <Text style={styles.buttonText}>Sending reset link...</Text>
                        </View>
                      ) : (
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* Footer Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Remember your password?{' '}
                  <Text
                    style={styles.footerLink}
                    onPress={() => navigation.navigate('Login')}
                  >
                    Log in
                  </Text>
                </Text>
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  spacer: {
    flex: 1,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardContent: {
    padding: 24,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.white,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  successIconContainer: {
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: '700',
  },
  successSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
