/**
 * Deep Linking Configuration
 * 
 * Centralized configuration for all deep link routes in the app.
 */

// Custom URL scheme
export const URL_SCHEME = 'murranno';

// Web domain for Universal Links / App Links
export const WEB_DOMAIN = 'murranno.com';

// App identifiers
export const IOS_BUNDLE_ID = 'com.murranno.music';
export const ANDROID_PACKAGE = 'com.murranno.music';

// Route definitions with parameters
export interface DeepLinkRoute {
  pattern: string;
  screen: string;
  params?: string[];
  requiresAuth: boolean;
  navigator?: string;
}

export const DEEP_LINK_ROUTES: Record<string, DeepLinkRoute> = {
  // Auth routes (no auth required)
  welcome: {
    pattern: '/welcome',
    screen: 'Welcome',
    requiresAuth: false,
    navigator: 'Auth',
  },
  login: {
    pattern: '/login',
    screen: 'Login',
    requiresAuth: false,
    navigator: 'Auth',
  },
  signup: {
    pattern: '/signup',
    screen: 'Signup',
    requiresAuth: false,
    navigator: 'Auth',
  },
  resetPassword: {
    pattern: '/reset-password',
    screen: 'ResetPassword',
    params: ['token'],
    requiresAuth: false,
    navigator: 'Auth',
  },
  verifyEmail: {
    pattern: '/verify-email',
    screen: 'VerifyEmail',
    params: ['token'],
    requiresAuth: false,
    navigator: 'Auth',
  },
  callback: {
    pattern: '/callback',
    screen: 'Callback',
    requiresAuth: false,
    navigator: 'Auth',
  },

  // Main app routes (auth required)
  dashboard: {
    pattern: '/dashboard',
    screen: 'ArtistDashboard',
    requiresAuth: true,
    navigator: 'Main',
  },
  release: {
    pattern: '/release/:id',
    screen: 'ReleaseDetail',
    params: ['id'],
    requiresAuth: true,
    navigator: 'Main',
  },
  releases: {
    pattern: '/releases',
    screen: 'ReleasesList',
    requiresAuth: true,
    navigator: 'Main',
  },
  artist: {
    pattern: '/artist/:id',
    screen: 'ArtistProfile',
    params: ['id'],
    requiresAuth: true,
    navigator: 'Main',
  },
  campaign: {
    pattern: '/campaign/:id',
    screen: 'CampaignTracking',
    params: ['id'],
    requiresAuth: true,
    navigator: 'Main',
  },
  campaigns: {
    pattern: '/campaigns',
    screen: 'CampaignsList',
    requiresAuth: true,
    navigator: 'Main',
  },
  upload: {
    pattern: '/upload',
    screen: 'Upload',
    requiresAuth: true,
    navigator: 'Main',
  },
  earnings: {
    pattern: '/earnings',
    screen: 'EarningsOverview',
    requiresAuth: true,
    navigator: 'Main',
  },
  wallet: {
    pattern: '/wallet',
    screen: 'Wallet',
    requiresAuth: true,
    navigator: 'Main',
  },
  analytics: {
    pattern: '/analytics',
    screen: 'Analytics',
    requiresAuth: true,
    navigator: 'Main',
  },
  promotions: {
    pattern: '/promotions',
    screen: 'PromotionsList',
    requiresAuth: true,
    navigator: 'Main',
  },
  promotionDetail: {
    pattern: '/promotions/:id',
    screen: 'PromotionDetail',
    params: ['id'],
    requiresAuth: true,
    navigator: 'Main',
  },
  profile: {
    pattern: '/profile',
    screen: 'ProfileOverview',
    requiresAuth: true,
    navigator: 'Main',
  },
  settings: {
    pattern: '/settings',
    screen: 'Settings',
    requiresAuth: true,
    navigator: 'Main',
  },
  notifications: {
    pattern: '/notifications',
    screen: 'Notifications',
    requiresAuth: true,
    navigator: 'Main',
  },
  subscription: {
    pattern: '/subscription',
    screen: 'SubscriptionPlans',
    requiresAuth: true,
    navigator: 'Main',
  },

  // Label routes
  labelDashboard: {
    pattern: '/label/dashboard',
    screen: 'LabelDashboard',
    requiresAuth: true,
    navigator: 'Main',
  },
  labelArtists: {
    pattern: '/label/artists',
    screen: 'ArtistRoster',
    requiresAuth: true,
    navigator: 'Main',
  },

  // Agency routes
  agencyDashboard: {
    pattern: '/agency/dashboard',
    screen: 'AgencyDashboard',
    requiresAuth: true,
    navigator: 'Main',
  },
  agencyClients: {
    pattern: '/agency/clients',
    screen: 'Clients',
    requiresAuth: true,
    navigator: 'Main',
  },

  // Admin routes
  admin: {
    pattern: '/admin',
    screen: 'AdminDashboard',
    requiresAuth: true,
    navigator: 'Admin',
  },
};

// Navigation linking configuration for React Navigation
export const getNavigationLinkingConfig = () => ({
  prefixes: [
    `${URL_SCHEME}://`,
    `https://${WEB_DOMAIN}`,
    `https://www.${WEB_DOMAIN}`,
  ],
  config: {
    screens: {
      Auth: {
        screens: {
          Splash: 'splash',
          Welcome: 'welcome',
          GetStarted: 'get-started',
          Login: 'login',
          Signup: 'signup',
          VerifyEmail: 'verify-email',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password',
          Callback: 'callback',
        },
      },
      Main: {
        screens: {
          DashboardTab: {
            screens: {
              ArtistDashboard: 'dashboard',
              LabelDashboard: 'label/dashboard',
              AgencyDashboard: 'agency/dashboard',
              NewsDetail: 'news/:id',
            },
          },
          ReleasesTab: {
            screens: {
              ReleasesList: 'releases',
              ReleaseDetail: 'release/:id',
              Upload: 'upload',
            },
          },
          PromotionsTab: {
            screens: {
              PromotionsList: 'promotions',
              PromotionDetail: 'promotions/:id',
              CampaignTracking: 'campaign/:id',
              CampaignsList: 'campaigns',
            },
          },
          EarningsTab: {
            screens: {
              EarningsOverview: 'earnings',
              Wallet: 'wallet',
              Analytics: 'analytics',
            },
          },
          ProfileTab: {
            screens: {
              ProfileOverview: 'profile',
              Settings: 'settings',
              Notifications: 'notifications',
              SubscriptionPlans: 'subscription',
            },
          },
        },
      },
      Admin: {
        screens: {
          AdminDashboard: 'admin',
          AdminUsers: 'admin/users',
          AdminContent: 'admin/content',
          AdminCampaigns: 'admin/campaigns',
        },
      },
      NotFound: '*',
    },
  },
});

// Helper to build deep link URLs
export const buildDeepLink = (
  routeKey: keyof typeof DEEP_LINK_ROUTES,
  params?: Record<string, string>,
  useHttps: boolean = false
): string => {
  const route = DEEP_LINK_ROUTES[routeKey];
  if (!route) {
    throw new Error(`Unknown route: ${routeKey}`);
  }

  let path = route.pattern;
  
  // Replace path params
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }

  const baseUrl = useHttps 
    ? `https://${WEB_DOMAIN}` 
    : `${URL_SCHEME}://`;

  return `${baseUrl}${path}`;
};

// Helper to parse route params from URL
export const parseRouteParams = (
  url: string,
  pattern: string
): Record<string, string> | null => {
  const patternParts = pattern.split('/').filter(Boolean);
  const urlParts = url.split('/').filter(Boolean);

  if (patternParts.length !== urlParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const urlPart = urlParts[i];

    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1);
      params[paramName] = urlPart;
    } else if (patternPart !== urlPart) {
      return null;
    }
  }

  return params;
};
