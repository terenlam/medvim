import { getSidebarDefaultOpen } from "./sidebar-state";

describe("getSidebarDefaultOpen", () => {
  it("defaults to open when no persisted state exists", () => {
    expect(getSidebarDefaultOpen(undefined)).toBe(true);
  });

  it("keeps the sidebar open for a true persisted state", () => {
    expect(getSidebarDefaultOpen("true")).toBe(true);
  });

  it("keeps the sidebar closed for a false persisted state", () => {
    expect(getSidebarDefaultOpen("false")).toBe(false);
  });
});
