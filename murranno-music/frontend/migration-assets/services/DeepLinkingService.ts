/**
 * Deep Linking Service
 * 
 * Handles URL parsing, route matching, and deep link processing.
 */

import { 
  URL_SCHEME, 
  WEB_DOMAIN, 
  DEEP_LINK_ROUTES, 
  DeepLinkRoute,
  parseRouteParams,
} from '../config/deepLinkingConfig';

export interface ParsedDeepLink {
  screen: string;
  params: Record<string, string>;
  requiresAuth: boolean;
  navigator?: string;
  queryParams: Record<string, string>;
  originalUrl: string;
  isOAuthCallback: boolean;
}

export interface OAuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn?: number;
  tokenType?: string;
}

// Deep link event log for debugging
const deepLinkLog: Array<{ timestamp: string; event: string; data?: any }> = [];

const logEvent = (event: string, data?: any) => {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    data,
  };
  deepLinkLog.push(entry);
  console.log(`[DeepLinkingService] ${event}`, data || '');
  
  // Keep only last 100 entries
  if (deepLinkLog.length > 100) {
    deepLinkLog.shift();
  }
};

export const getDeepLinkLog = () => [...deepLinkLog];
export const clearDeepLinkLog = () => { deepLinkLog.length = 0; };

export class DeepLinkingService {
  /**
   * Parse a deep link URL and return structured data
   */
  static parseUrl(url: string): ParsedDeepLink | null {
    logEvent('Parsing URL', { url });

    try {
      // Normalize URL
      let normalizedUrl = url;
      
      // Handle custom scheme
      if (url.startsWith(`${URL_SCHEME}://`)) {
        normalizedUrl = url.replace(`${URL_SCHEME}://`, '/');
      }
      
      // Handle web URLs
      if (url.startsWith(`https://${WEB_DOMAIN}`)) {
        normalizedUrl = url.replace(`https://${WEB_DOMAIN}`, '');
      }
      if (url.startsWith(`https://www.${WEB_DOMAIN}`)) {
        normalizedUrl = url.replace(`https://www.${WEB_DOMAIN}`, '');
      }

      // Extract path and query/hash
      let path = normalizedUrl;
      let queryString = '';
      let hashString = '';

      // Extract hash fragment (for OAuth tokens)
      const hashIndex = path.indexOf('#');
      if (hashIndex !== -1) {
        hashString = path.substring(hashIndex + 1);
        path = path.substring(0, hashIndex);
      }

      // Extract query params
      const queryIndex = path.indexOf('?');
      if (queryIndex !== -1) {
        queryString = path.substring(queryIndex + 1);
        path = path.substring(0, queryIndex);
      }

      // Parse query params
      const queryParams: Record<string, string> = {};
      if (queryString) {
        const params = new URLSearchParams(queryString);
        params.forEach((value, key) => {
          queryParams[key] = value;
        });
      }

      // Parse hash params (for OAuth)
      if (hashString) {
        const hashParams = new URLSearchParams(hashString);
        hashParams.forEach((value, key) => {
          queryParams[key] = value;
        });
      }

      // Check if this is an OAuth callback
      const isOAuthCallback = path === '/callback' || 
        queryParams.access_token !== undefined;

      // Find matching route
      for (const [key, route] of Object.entries(DEEP_LINK_ROUTES)) {
        const params = parseRouteParams(path, route.pattern);
        if (params !== null) {
          logEvent('Route matched', { route: key, params });
          return {
            screen: route.screen,
            params,
            requiresAuth: route.requiresAuth,
            navigator: route.navigator,
            queryParams,
            originalUrl: url,
            isOAuthCallback,
          };
        }
      }

      logEvent('No route matched', { path });
      return null;
    } catch (error) {
      logEvent('Parse error', { error });
      return null;
    }
  }

  /**
   * Extract OAuth tokens from URL (for OAuth callback handling)
   */
  static extractOAuthTokens(url: string): OAuthTokens {
    logEvent('Extracting OAuth tokens', { url });

    const result: OAuthTokens = {
      accessToken: null,
      refreshToken: null,
    };

    try {
      // Try hash fragment first (most common for OAuth)
      const hashIndex = url.indexOf('#');
      if (hashIndex !== -1) {
        const fragment = url.substring(hashIndex + 1);
        const params = new URLSearchParams(fragment);
        
        result.accessToken = params.get('access_token');
        result.refreshToken = params.get('refresh_token');
        result.expiresIn = params.get('expires_in') 
          ? parseInt(params.get('expires_in')!, 10) 
          : undefined;
        result.tokenType = params.get('token_type') || undefined;
      }

      // Try query params as fallback
      if (!result.accessToken) {
        const queryIndex = url.indexOf('?');
        if (queryIndex !== -1) {
          const query = url.substring(queryIndex + 1).split('#')[0];
          const params = new URLSearchParams(query);
          
          result.accessToken = params.get('access_token');
          result.refreshToken = params.get('refresh_token');
          result.expiresIn = params.get('expires_in') 
            ? parseInt(params.get('expires_in')!, 10) 
            : undefined;
          result.tokenType = params.get('token_type') || undefined;
        }
      }

      logEvent('Tokens extracted', { 
        hasAccess: !!result.accessToken, 
        hasRefresh: !!result.refreshToken 
      });
    } catch (error) {
      logEvent('Token extraction error', { error });
    }

    return result;
  }

  /**
   * Check if a URL is a valid deep link for this app
   */
  static isValidDeepLink(url: string): boolean {
    if (!url) return false;
    
    return (
      url.startsWith(`${URL_SCHEME}://`) ||
      url.startsWith(`https://${WEB_DOMAIN}`) ||
      url.startsWith(`https://www.${WEB_DOMAIN}`)
    );
  }

  /**
   * Check if URL is an OAuth callback
   */
  static isOAuthCallback(url: string): boolean {
    return url.includes('/callback') && 
      (url.includes('access_token') || url.includes('code='));
  }

  /**
   * Get the route configuration for a screen name
   */
  static getRouteForScreen(screenName: string): DeepLinkRoute | null {
    for (const route of Object.values(DEEP_LINK_ROUTES)) {
      if (route.screen === screenName) {
        return route;
      }
    }
    return null;
  }

  /**
   * Build navigation state for React Navigation from parsed link
   */
  static buildNavigationState(parsedLink: ParsedDeepLink) {
    const { screen, params, navigator } = parsedLink;

    // This will vary based on your navigation structure
    // Adjust according to your actual navigator setup
    return {
      routes: [
        {
          name: navigator || 'Main',
          state: {
            routes: [
              {
                name: screen,
                params: { ...params, ...parsedLink.queryParams },
              },
            ],
          },
        },
      ],
    };
  }
}

export default DeepLinkingService;
