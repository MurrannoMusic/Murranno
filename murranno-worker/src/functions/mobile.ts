import { requireUser, fail, type Handler } from "./context";
import { now } from "../lib/db";
const mobileConfig: Handler = async (ctx) => {
  const settings = await ctx.db.first(
    "platform_settings",
    "SELECT usd_to_ngn_rate, minimum_payout_amount, support_email FROM platform_settings LIMIT 1",
  );
  return {
    success: true,
    settings,
    providers: {
      google: Boolean(ctx.env.GOOGLE_CLIENT_ID && ctx.env.GOOGLE_CLIENT_SECRET),
      apple: Boolean(
        ctx.env.APPLE_SERVICES_ID &&
        ctx.env.APPLE_TEAM_ID &&
        ctx.env.APPLE_KEY_ID &&
        ctx.env.APPLE_PRIVATE_KEY,
      ),
    },
    latestVersion: ctx.env.MOBILE_APP_VERSION || null,
    storeUrls: {
      ios: ctx.env.IOS_STORE_URL || null,
      android: ctx.env.ANDROID_STORE_URL || null,
    },
    pushEnabled: Boolean(ctx.env.FCM_SERVICE_ACCOUNT_JSON),
  };
};
const preferenceKeys = [
  "email_notifications",
  "push_notifications",
  "in_app_notifications",
  "release_updates",
  "campaign_updates",
  "earnings_alerts",
  "marketing_emails",
];
const getPreferences: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const preferences = await ctx.db.first(
    "notification_preferences",
    "SELECT * FROM notification_preferences WHERE user_id = ?",
    userId,
  );
  return {
    success: true,
    preferences:
      preferences ||
      Object.fromEntries(
        preferenceKeys.map((key) => [key, key !== "marketing_emails"]),
      ),
  };
};
const updatePreferences: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const updates: Record<string, unknown> = {
    user_id: userId,
    updated_at: now(),
  };
  for (const key of preferenceKeys)
    if (ctx.body[key] !== undefined) {
      if (typeof ctx.body[key] !== "boolean")
        throw fail(400, "Notification preferences must be true or false");
      updates[key] = ctx.body[key];
    }
  const preferences = await ctx.db.upsert("notification_preferences", updates, [
    "user_id",
  ]);
  return { success: true, preferences };
};
export const mobileFunctions: Record<string, Handler> = {
  "get-mobile-config": mobileConfig,
  "get-notification-preferences": getPreferences,
  "update-notification-preferences": updatePreferences,
};
