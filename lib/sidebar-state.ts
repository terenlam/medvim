export const SIDEBAR_STATE_COOKIE = "sidebar_state";

/** Read the persisted sidebar state, defaulting to an open sidebar. */
export function getSidebarDefaultOpen(value: string | undefined): boolean {
  return value !== "false";
}
