// Navigation type definitions for React Navigation
import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack (before login)
export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  GetStarted: undefined;
  Login: undefined;
  Signup: undefined;
  VerifyEmail: { email?: string };
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
};

// Main Tab Navigator (bottom tabs)
export type MainTabParamList = {
  DashboardTab: undefined;
  ReleasesTab: undefined;
  PromotionsTab: undefined;
  EarningsTab: undefined;
  ProfileTab: undefined;
};

// Dashboard Stack (inside Dashboard Tab)
export type DashboardStackParamList = {
  ArtistDashboard: undefined;
  LabelDashboard: undefined;
  AgencyDashboard: undefined;
  UserTypeSelection: undefined;
  UserTypeSwitcher: undefined;
  NewsDetail: { id: string };
};

// Releases Stack
export type ReleasesStackParamList = {
  ReleasesList: undefined;
  ReleaseDetail: { id: string };
  Upload: undefined;
};

// Promotions Stack
export type PromotionsStackParamList = {
  PromotionsList: undefined;
  CampaignTracking: undefined;
  CampaignPaymentSuccess: { reference?: string };
};

// Earnings Stack
export type EarningsStackParamList = {
  EarningsOverview: undefined;
  Analytics: undefined;
  LabelAnalytics: undefined;
  AgencyAnalytics: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileOverview: undefined;
  ArtistProfile: undefined;
  Settings: undefined;
  SubscriptionPlans: undefined;
};

// Label Management Stack (for label users)
export type LabelStackParamList = {
  ArtistManagement: undefined;
  ArtistDetail: { artistId: string };
  PayoutManager: undefined;
};

// Agency Management Stack (for agency users)
export type AgencyStackParamList = {
  ClientManagement: undefined;
  CampaignManager: undefined;
  Results: undefined;
};

// Admin Stack (admin users only)
export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminContent: undefined;
  AdminCampaigns: undefined;
  AdminPromotions: undefined;
  AdminPayments: undefined;
  AdminFinancials: undefined;
  AdminSubscriptions: undefined;
  AdminAnalytics: undefined;
  AdminNotifications: undefined;
  AdminSettings: undefined;
  AdminAuditLogs: undefined;
  // Preview routes
  PreviewArtist: undefined;
  PreviewLabel: undefined;
  PreviewAgency: undefined;
};

// Legal/Support Stack (accessible without auth)
export type LegalStackParamList = {
  Terms: undefined;
  Privacy: undefined;
  FAQ: undefined;
  Support: undefined;
};

// Root Stack (combines all navigators)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
  Legal: NavigatorScreenParams<LegalStackParamList>;
  // Modal screens
  NotFound: undefined;
};

// Helper type for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Screen names as constants for type-safe navigation
export const SCREENS = {
  // Auth
  SPLASH: 'Splash',
  WELCOME: 'Welcome',
  GET_STARTED: 'GetStarted',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  VERIFY_EMAIL: 'VerifyEmail',
  FORGOT_PASSWORD: 'ForgotPassword',
  RESET_PASSWORD: 'ResetPassword',
  
  // Dashboard
  ARTIST_DASHBOARD: 'ArtistDashboard',
  LABEL_DASHBOARD: 'LabelDashboard',
  AGENCY_DASHBOARD: 'AgencyDashboard',
  USER_TYPE_SELECTION: 'UserTypeSelection',
  USER_TYPE_SWITCHER: 'UserTypeSwitcher',
  NEWS_DETAIL: 'NewsDetail',
  
  // Releases
  RELEASES_LIST: 'ReleasesList',
  RELEASE_DETAIL: 'ReleaseDetail',
  UPLOAD: 'Upload',
  
  // Promotions
  PROMOTIONS_LIST: 'PromotionsList',
  CAMPAIGN_TRACKING: 'CampaignTracking',
  CAMPAIGN_PAYMENT_SUCCESS: 'CampaignPaymentSuccess',
  
  // Earnings
  EARNINGS_OVERVIEW: 'EarningsOverview',
  ANALYTICS: 'Analytics',
  LABEL_ANALYTICS: 'LabelAnalytics',
  AGENCY_ANALYTICS: 'AgencyAnalytics',
  
  // Profile
  PROFILE_OVERVIEW: 'ProfileOverview',
  ARTIST_PROFILE: 'ArtistProfile',
  SETTINGS: 'Settings',
  SUBSCRIPTION_PLANS: 'SubscriptionPlans',
  
  // Label
  ARTIST_MANAGEMENT: 'ArtistManagement',
  ARTIST_DETAIL: 'ArtistDetail',
  PAYOUT_MANAGER: 'PayoutManager',
  
  // Agency
  CLIENT_MANAGEMENT: 'ClientManagement',
  CAMPAIGN_MANAGER: 'CampaignManager',
  RESULTS: 'Results',
  
  // Legal
  TERMS: 'Terms',
  PRIVACY: 'Privacy',
  FAQ: 'FAQ',
  SUPPORT: 'Support',
} as const;
