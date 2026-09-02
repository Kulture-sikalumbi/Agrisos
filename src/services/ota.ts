/**
 * Expo OTA helpers.
 * Native rebuilds are still required for new native modules;
 * JS/asset changes can ship via `eas update`.
 *
 * Import is deferred so an old binary (without ExpoUpdates linked)
 * does not crash the whole app on startup / Fast Refresh.
 */
export async function checkForOtaUpdate(): Promise<void> {
  if (__DEV__) return;
  try {
    const Updates = await import('expo-updates');
    if (!Updates.isEnabled) return;
    const result = await Updates.checkForUpdateAsync();
    if (result.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch {
    // Stay on current bundle if offline / native module missing / misconfigured.
  }
}
