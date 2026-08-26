"use client";

import { useEffect } from "react";
import {
  DEVICE_LAYOUT_CHANGE_EVENT,
  DEVICE_LAYOUT_STORAGE_KEY,
  getAutomaticViewportProfile,
  normalizeDeviceLayoutProfile,
} from "@/lib/deviceLayout";

export default function DeviceLayoutController() {
  useEffect(() => {
    const root = document.documentElement;

    function applyDeviceLayout() {
      const profile = normalizeDeviceLayoutProfile(
        localStorage.getItem(DEVICE_LAYOUT_STORAGE_KEY)
      );

      root.dataset.layoutProfile = profile;

      if (profile === "automatic") {
        const viewport = getAutomaticViewportProfile(
          window.innerWidth,
          window.innerHeight
        );
        root.dataset.viewportSize = viewport.size;
        root.dataset.viewportOrientation = viewport.orientation;
        root.style.setProperty("--automatic-viewport-height", `${window.innerHeight}px`);
      } else {
        delete root.dataset.viewportSize;
        delete root.dataset.viewportOrientation;
        root.style.removeProperty("--automatic-viewport-height");
      }
    }

    applyDeviceLayout();
    window.addEventListener("resize", applyDeviceLayout);
    window.addEventListener("orientationchange", applyDeviceLayout);
    window.addEventListener("storage", applyDeviceLayout);
    window.addEventListener(DEVICE_LAYOUT_CHANGE_EVENT, applyDeviceLayout);

    return () => {
      window.removeEventListener("resize", applyDeviceLayout);
      window.removeEventListener("orientationchange", applyDeviceLayout);
      window.removeEventListener("storage", applyDeviceLayout);
      window.removeEventListener(DEVICE_LAYOUT_CHANGE_EVENT, applyDeviceLayout);
    };
  }, []);

  return null;
}
