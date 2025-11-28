export function getOrigin() {
  // TODO: Revisit this if we are doing SSR.
  const origin = window.location.origin;

  // Remove trailing slash from origin if it exists.
  if (origin[origin.length - 1] === "/") {
    return origin.slice(0, -1);
  }

  return origin;
}

export const isMac =
  typeof window !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;

export const ModKey = isMac ? "⌘" : "Ctrl";

export const FOCUS_TOOLTIP_CLASS =
  "bg-background z-5 w-fit rounded-md px-3 py-1.5 text-xs text-balance border shadow-md";
