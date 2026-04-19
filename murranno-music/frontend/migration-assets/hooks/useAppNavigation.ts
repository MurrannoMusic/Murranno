import { useCallback } from 'react';
import { useNavigation, CommonActions, StackActions } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { SCREENS } from '../navigation/types';

/**
 * Custom navigation hook with haptic feedback and type-safe navigation
 */
export const useAppNavigation = () => {
  const navigation = useNavigation();

  const navigateWithHaptics = useCallback(
    (screenName: string, params?: object) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate(screenName as never, params as never);
    },
    [navigation]
  );

  const goBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const resetToScreen = useCallback(
    (screenName: string, params?: object) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: screenName, params }],
        })
      );
    },
    [navigation]
  );

  const replaceScreen = useCallback(
    (screenName: string, params?: object) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.dispatch(StackActions.replace(screenName, params));
    },
    [navigation]
  );

  const pushScreen = useCallback(
    (screenName: string, params?: object) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.dispatch(StackActions.push(screenName, params));
    },
    [navigation]
  );

  const popToTop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.dispatch(StackActions.popToTop());
  }, [navigation]);

  // Type-safe navigation helpers for common screens
  const navigateTo = {
    // Auth screens
    splash: () => navigateWithHaptics(SCREENS.SPLASH),
    welcome: () => navigateWithHaptics(SCREENS.WELCOME),
    login: () => navigateWithHaptics(SCREENS.LOGIN),
    signup: () => navigateWithHaptics(SCREENS.SIGNUP),
    forgotPassword: () => navigateWithHaptics(SCREENS.FORGOT_PASSWORD),

    // Dashboard screens
    artistDashboard: () => navigateWithHaptics(SCREENS.ARTIST_DASHBOARD),
    labelDashboard: () => navigateWithHaptics(SCREENS.LABEL_DASHBOARD),
    agencyDashboard: () => navigateWithHaptics(SCREENS.AGENCY_DASHBOARD),
    userTypeSelection: () => navigateWithHaptics(SCREENS.USER_TYPE_SELECTION),
    newsDetail: (id: string) => navigateWithHaptics(SCREENS.NEWS_DETAIL, { id }),

    // Releases screens
    releases: () => navigateWithHaptics(SCREENS.RELEASES_LIST),
    releaseDetail: (id: string) => navigateWithHaptics(SCREENS.RELEASE_DETAIL, { id }),
    upload: () => navigateWithHaptics(SCREENS.UPLOAD),

    // Promotions screens
    promotions: () => navigateWithHaptics(SCREENS.PROMOTIONS_LIST),
    campaignTracking: () => navigateWithHaptics(SCREENS.CAMPAIGN_TRACKING),

    // Earnings screens
    earnings: () => navigateWithHaptics(SCREENS.EARNINGS_OVERVIEW),
    analytics: () => navigateWithHaptics(SCREENS.ANALYTICS),

    // Profile screens
    profile: () => navigateWithHaptics(SCREENS.PROFILE_OVERVIEW),
    artistProfile: () => navigateWithHaptics(SCREENS.ARTIST_PROFILE),
    settings: () => navigateWithHaptics(SCREENS.SETTINGS),
    subscriptionPlans: () => navigateWithHaptics(SCREENS.SUBSCRIPTION_PLANS),

    // Label screens
    artistManagement: () => navigateWithHaptics(SCREENS.ARTIST_MANAGEMENT),
    artistDetail: (artistId: string) => navigateWithHaptics(SCREENS.ARTIST_DETAIL, { artistId }),

    // Agency screens
    clientManagement: () => navigateWithHaptics(SCREENS.CLIENT_MANAGEMENT),
    campaignManager: () => navigateWithHaptics(SCREENS.CAMPAIGN_MANAGER),
    results: () => navigateWithHaptics(SCREENS.RESULTS),

    // Legal screens
    terms: () => navigateWithHaptics(SCREENS.TERMS),
    privacy: () => navigateWithHaptics(SCREENS.PRIVACY),
    faq: () => navigateWithHaptics(SCREENS.FAQ),
    support: () => navigateWithHaptics(SCREENS.SUPPORT),
  };

  return {
    navigation,
    navigate: navigateWithHaptics,
    goBack,
    resetToScreen,
    replaceScreen,
    pushScreen,
    popToTop,
    canGoBack: navigation.canGoBack,
    navigateTo,
  };
};

export default useAppNavigation;
