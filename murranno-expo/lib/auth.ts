import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/integrations/supabase/client";
WebBrowser.maybeCompleteAuthSession();
export const appRedirect = (path: string) =>
  Platform.OS === "web"
    ? `${window.location.origin}/${path}`
    : Linking.createURL(path, { scheme: "murrannoexpo" });
export async function acceptAuthUrl(url: string) {
  const query = new URLSearchParams(
    url.split("#")[1] || url.split("?")[1] || "",
  );
  if (query.get("error"))
    throw new Error(
      query.get("error_description") || "Sign-in could not be completed",
    );
  const access_token = query.get("access_token"),
    refresh_token = query.get("refresh_token");
  if (!access_token || !refresh_token) return null;
  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return query.get("type") || "oauth";
}
export async function signInWithProvider(provider: "google" | "apple") {
  const redirectTo = appRedirect("auth/callback");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url)
    throw error || new Error("Provider sign-in is unavailable");
  if (Platform.OS === "web") {
    window.location.assign(data.url);
    return false;
  }
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") return false;
  await acceptAuthUrl(result.url);
  return true;
}
