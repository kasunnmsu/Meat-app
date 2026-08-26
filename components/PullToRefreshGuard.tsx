"use client";

import { useEffect } from "react";

function canScrollUp(target: EventTarget | null) {
  let element = target instanceof Element ? target : null;

  while (element && element !== document.documentElement) {
    const style = window.getComputedStyle(element);
    const hasVerticalScroll =
      /(auto|scroll|overlay)/.test(style.overflowY) &&
      element.scrollHeight > element.clientHeight;

    if (hasVerticalScroll && element.scrollTop > 0) {
      return true;
    }

    element = element.parentElement;
  }

  return window.scrollY > 0;
}

export default function PullToRefreshGuard() {
  useEffect(() => {
    let touchStartY: number | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || canScrollUp(event.target)) {
        touchStartY = null;
        return;
      }

      touchStartY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartY === null || event.touches.length !== 1) {
        return;
      }

      const isPullingDown = event.touches[0].clientY > touchStartY;
      if (isPullingDown && !canScrollUp(event.target)) {
        event.preventDefault();
      }
    };

    const resetTouch = () => {
      touchStartY = null;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", resetTouch, { passive: true });
    document.addEventListener("touchcancel", resetTouch, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", resetTouch);
      document.removeEventListener("touchcancel", resetTouch);
    };
  }, []);

  return null;
}
