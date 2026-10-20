import type { Env } from "../env";
import { DB } from "./db";
import { b64url } from "./crypto";

let cached: { email: string; token: string; expires: number } | undefined;
async function credentials(env: Env) {
  const service = JSON.parse(env.FCM_SERVICE_ACCOUNT_JSON!);
  if (!service.project_id || !service.client_email || !service.private_key)
    throw new Error("Invalid FCM service account configuration");
  if (
    cached &&
    cached.email === service.client_email &&
    cached.expires > Date.now() + 60_000
  )
    return { project: service.project_id, token: cached.token };
  const encode = (value: unknown) =>
    b64url(new TextEncoder().encode(JSON.stringify(value)));
  const seconds = Math.floor(Date.now() / 1000);
  const payload = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: service.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: seconds, exp: seconds + 3600 })}`;
  const pem = service.private_key.replace(/-----[^-]+-----|\s/g, "");
  const key = await crypto.subtle.importKey(
    "pkcs8",
    Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = b64url(
    await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(payload),
    ),
  );
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${payload}.${signature}`,
    }),
  });
  const data = (await response.json()) as any;
  if (!response.ok || !data.access_token)
    throw new Error("FCM authentication failed");
  cached = {
    email: service.client_email,
    token: data.access_token,
    expires: Date.now() + Number(data.expires_in || 3600) * 1000,
  };
  return { project: service.project_id, token: cached.token };
}

/** Returns confirmed FCM acceptances, never the number of registered devices. */
export async function sendUserPush(
  env: Env,
  db: DB,
  userId: string,
  title: string,
  body: string,
  topic?: string,
): Promise<number> {
  if (!env.FCM_SERVICE_ACCOUNT_JSON) return 0;
  const prefs = await db.first(
    "notification_preferences",
    "SELECT * FROM notification_preferences WHERE user_id = ?",
    userId,
  );
  if (prefs && (!prefs.push_notifications || (topic && !prefs[topic])))
    return 0;
  const devices = await db.all(
    "push_notification_tokens",
    "SELECT * FROM push_notification_tokens WHERE user_id = ? AND is_active = 1",
    userId,
  );
  if (!devices.length) return 0;
  try {
    const auth = await credentials(env);
    let sent = 0;
    for (const device of devices) {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${auth.project}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: { token: device.token, notification: { title, body } },
          }),
        },
      );
      if (response.ok) sent++;
      else {
        const error = (await response.json()) as any;
        if (
          error.error?.details?.some(
            (detail: any) => detail.errorCode === "UNREGISTERED",
          )
        )
          await db.update(
            "push_notification_tokens",
            { is_active: false },
            "id = ?",
            device.id,
          );
        console.error("FCM delivery rejected", response.status);
      }
    }
    return sent;
  } catch {
    console.error("Push notification delivery failed");
    return 0;
  }
}
