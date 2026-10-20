import { PermissionsAndroid, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { invoke } from "./api";
export async function registerDevicePush(request = false): Promise<void> {
  const client = messaging();
  if (Platform.OS === "android" && Number(Platform.Version) >= 33) {
    const allowed = request
      ? (await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        )) === PermissionsAndroid.RESULTS.GRANTED
      : await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
    if (!allowed)
      throw new Error(
        "Allow notifications in your device settings to receive push updates.",
      );
  }
  const permission = request
    ? await client.requestPermission()
    : await client.hasPermission();
  if (
    permission !== messaging.AuthorizationStatus.AUTHORIZED &&
    permission !== messaging.AuthorizationStatus.PROVISIONAL
  )
    throw new Error("Notification permission has not been granted.");
  if (!client.isDeviceRegisteredForRemoteMessages)
    await client.registerDeviceForRemoteMessages();
  await invoke("register-push-token", {
    token: await client.getToken(),
    platform: Platform.OS,
    deviceInfo: { osVersion: String(Platform.Version) },
  });
}
export async function watchDevicePush(): Promise<() => void> {
  await registerDevicePush(false);
  return messaging().onTokenRefresh(async (token) => {
    await invoke("register-push-token", { token, platform: Platform.OS }).catch(
      () => {},
    );
  });
}
