// Navigation exports
export { RootNavigator } from './RootNavigator';
export { AuthNavigator } from './AuthNavigator';
export { MainTabNavigator } from './MainTabNavigator';

// Stack navigators
export { DashboardNavigator } from './stacks/DashboardNavigator';
export { ReleasesNavigator } from './stacks/ReleasesNavigator';
export { PromotionsNavigator } from './stacks/PromotionsNavigator';
export { EarningsNavigator } from './stacks/EarningsNavigator';
export { ProfileNavigator } from './stacks/ProfileNavigator';
export { AdminNavigator } from './stacks/AdminNavigator';

// New role-specific stack navigators
export { default as ArtistStackNavigator } from './ArtistStackNavigator';
export { default as LabelStackNavigator } from './LabelStackNavigator';
export { default as AgencyStackNavigator } from './AgencyStackNavigator';

// Types
export * from './types';

// Type exports from new navigators
export type { ArtistStackParamList } from './ArtistStackNavigator';
export type { LabelStackParamList } from './LabelStackNavigator';
export type { AgencyStackParamList } from './AgencyStackNavigator';

// Navigation utilities
export { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
export { useNavigationState } from '@react-navigation/native';
