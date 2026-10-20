import { Alert, Platform } from "react-native";
import { API_URL, supabase } from "@/integrations/supabase/client";

export async function errorMessage(
  error: any,
  fallback = "The request could not be completed.",
): Promise<string> {
  try {
    const body = await error?.context?.clone?.().json();
    return body?.error || body?.message || error?.message || fallback;
  } catch {
    return error?.message || fallback;
  }
}
export async function invoke<T = any>(
  name: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(
    name,
    body ? { body } : undefined,
  );
  if (error) throw new Error(await errorMessage(error));
  if (data?.success === false) throw new Error(data.error || "Request failed");
  return data as T;
}
export async function changeCredentials(
  body: { email?: string; password?: string; current_password?: string },
  redirectTo?: string,
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in again.");
  const response = await fetch(
    `${API_URL}/auth/v1/user${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ""}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        apikey: "public",
      },
      body: JSON.stringify(body),
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.msg || data.message || data.error || "Could not update your account",
    );
  await supabase.auth.getUser();
  return data;
}
export function notify(title: string, message: string) {
  if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}
export function confirmAction(
  title: string,
  message: string,
): Promise<boolean> {
  if (Platform.OS === "web")
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise((resolve) =>
    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    ),
  );
}
