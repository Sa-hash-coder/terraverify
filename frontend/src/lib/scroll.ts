/**
 * Smooth roll-down animation to a target element with graceful cubic easing.
 * Respects prefers-reduced-motion for accessibility.
 */
export function smoothScrollTo(
  targetId: string,
  e?: React.MouseEvent | MouseEvent,
  headerOffset = 80,
  duration = 950
) {
  if (e && typeof e.preventDefault === "function") {
    e.preventDefault();
  }

  if (typeof window === "undefined") return;

  const cleanId = targetId.startsWith("#") ? targetId.slice(1) : targetId;
  const target = document.getElementById(cleanId);
  if (!target) {
    if (targetId.startsWith("#")) {
      window.location.hash = targetId;
    }
    return;
  }

  // Respect reduced motion accessibility
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const startPosition = window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
  const elementPosition = target.getBoundingClientRect().top;
  const offsetPosition = Math.max(0, elementPosition + startPosition - headerOffset);

  if (prefersReducedMotion) {
    window.scrollTo({ top: offsetPosition, behavior: "auto" });
    window.history.pushState(null, "", `#${cleanId}`);
    return;
  }

  const distance = offsetPosition - startPosition;
  let startTime: number | null = null;

  // Cubic easeInOut easing curve for a satisfying rolling acceleration and deceleration
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const step = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo(0, startPosition + distance * ease);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      window.history.pushState(null, "", `#${cleanId}`);
    }
  };

  window.requestAnimationFrame(step);
}
