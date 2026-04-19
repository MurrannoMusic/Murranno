import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';

const SignupScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { navigateTo, goBack } = useAppNavigation();
  const { signUp, user } = useAuth();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    if (user) {
      navigateTo.artistDashboard();
    }
  }, [user]);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        variant: 'error',
      });
      return;
    }
    
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const { error } = await signUp(email, password, fullName);
      
      if (!error) {
        setShowVerification(true);
        toast({
          title: 'Check your email',
          description: 'We sent you a verification link',
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f0f23']}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={[styles.verificationContainer, { paddingTop: insets.top }]}>
          <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Verify Your Email</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.verificationIcon}>
                  <Ionicons name="mail" size={40} color={colors.primary} />
                </View>
                <Text style={styles.verificationText}>
                  We've sent a verification link to
                </Text>
                <Text style={styles.emailText}>{email}</Text>
                <Text style={styles.verificationSubtext}>
                  Please check your inbox and click the link to verify your account.
                </Text>
                
                <Button
                  variant="default"
                  size="lg"
                  onPress={() => setShowVerification(false)}
                  style={styles.backToSignupButton}
                >
                  Back to Signup
                </Button>
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + spacing[4] },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={goBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.spacer} />

          {/* Signup Card */}
          <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Join Murranno Music</Text>
              </View>

              <View style={styles.cardContent}>
                {/* Social Login */}
                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Continue with Google</Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />

                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Input
                    label="Password"
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    rightIcon={
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={colors.mutedForeground}
                      />
                    }
                    onRightIconPress={() => setShowPassword(!showPassword)}
                  />

                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />

                  <Button
                    variant="default"
                    size="lg"
                    onPress={handleSignup}
                    loading={loading}
                    disabled={!fullName || !email || !password || !confirmPassword}
                    style={styles.signupButton}
                  >
                    Create Account
                  </Button>
                </View>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigateTo.login()}>
                    <Text style={styles.loginLink}>Log in</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
    minHeight: spacing[8],
  },
  cardBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardHeader: {
    padding: spacing[6],
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardContent: {
    padding: spacing[6],
  },
  socialButtons: {
    gap: spacing[3],
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  socialButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    paddingHorizontal: spacing[3],
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  form: {
    gap: spacing[4],
  },
  signupButton: {
    marginTop: spacing[2],
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
  loginText: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  loginLink: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  // Verification screen styles
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  verificationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing[4],
  },
  verificationText: {
    fontSize: typography.fontSizes.base,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  emailText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: spacing[1],
  },
  verificationSubtext: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: spacing[4],
  },
  backToSignupButton: {
    marginTop: spacing[6],
  },
});

export default SignupScreen;
