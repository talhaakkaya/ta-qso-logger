/**
 * useSwipeToOpenSidebar Hook
 * Detects swipe gestures from the left edge of the screen to open the sidebar on mobile
 */

import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

// Configuration
const EDGE_THRESHOLD = 30; // Touch must start within 30px from left edge
const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger open
const MAX_VERTICAL_DEVIATION = 100; // Max vertical movement allowed for horizontal swipe

export function useSwipeToOpenSidebar() {
  const { setOpenMobile, isMobile, openMobile } = useSidebar();
  const isMobileDevice = useIsMobile();

  useEffect(() => {
    // Only activate on mobile devices
    if (!isMobile || !isMobileDevice) {
      return;
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isValidSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Don't activate if sidebar is already open
      if (openMobile) {
        return;
      }

      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();

      // Check if touch started from left edge
      isValidSwipe = touchStartX <= EDGE_THRESHOLD;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isValidSwipe) {
        return;
      }

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = Math.abs(touch.clientY - touchStartY);

      // If moving too much vertically, it's not a horizontal swipe
      if (deltaY > MAX_VERTICAL_DEVIATION) {
        isValidSwipe = false;
        return;
      }

      // Prevent default scrolling while swiping
      if (deltaX > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isValidSwipe) {
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = Math.abs(touch.clientY - touchStartY);
      const deltaTime = Date.now() - touchStartTime;

      // Check if it's a valid right swipe
      const isRightSwipe = deltaX > SWIPE_THRESHOLD;
      const isHorizontal = deltaY < MAX_VERTICAL_DEVIATION;
      const isQuick = deltaTime < 500; // Swipe should be quick (< 500ms)

      if (isRightSwipe && isHorizontal && isQuick) {
        setOpenMobile(true);
      }

      isValidSwipe = false;
    };

    // Add event listeners
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, isMobileDevice, openMobile, setOpenMobile]);
}
