export const DEVICE_LAYOUT_STORAGE_KEY = "deviceLayoutProfile";
export const DEVICE_LAYOUT_CHANGE_EVENT = "device-layout-profile-change";

const DEVICE_SETTINGS_PIN = "banana2";

export type DeviceLayoutProfile = "current" | "automatic";
export type AutomaticViewportSize = "phone" | "compact-tablet" | "wide";
export type ViewportOrientation = "portrait" | "landscape";

export function normalizeDeviceLayoutProfile(
  value: unknown
): DeviceLayoutProfile {
  return value === "automatic" ? "automatic" : "current";
}

export function isDeviceSettingsPinValid(value: string) {
  return value === DEVICE_SETTINGS_PIN;
}

export function getAutomaticViewportProfile(width: number, height: number) {
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0;
  const safeHeight = Number.isFinite(height) ? Math.max(0, height) : 0;
  const size: AutomaticViewportSize =
    safeWidth <= 540
      ? "phone"
      : safeWidth <= 900
        ? "compact-tablet"
        : "wide";
  const orientation: ViewportOrientation =
    safeWidth > safeHeight ? "landscape" : "portrait";

  return { size, orientation };
}
