export async function registerDevicePush(_request = false): Promise<void> {
  throw new Error(
    "Push notifications require the installed Android or iOS app.",
  );
}
export async function watchDevicePush(): Promise<() => void> {
  return () => {};
}
