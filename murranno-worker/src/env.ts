export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  AUTH_LIMITER?: RateLimit;
  ENVIRONMENT: string;
  APP_URL: string;
  ALLOWED_REDIRECTS: string;
  EMAIL_FROM: string;
  JWT_SECRET: string;
  MOBILE_APP_VERSION?: string;
  IOS_STORE_URL?: string;
  ANDROID_STORE_URL?: string;
  FCM_SERVICE_ACCOUNT_JSON?: string;
  PAYSTACK_SECRET_KEY?: string;
  SEND_EMAIL?: SendEmail;
  RESEND_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APPLE_SERVICES_ID?: string;
  APPLE_TEAM_ID?: string;
  APPLE_KEY_ID?: string;
  APPLE_PRIVATE_KEY?: string;
}

export interface AuthContext {
  userId: string;
  email: string;
  sessionId: string;
  isAdmin: boolean;
  tier: string;
  sessionMethod: string;
  sessionCreatedAt: string;
}

export type AppEnv = { Bindings: Env; Variables: { auth: AuthContext | null } };
