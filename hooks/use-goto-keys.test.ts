import { act, renderHook } from "@testing-library/react";

import { useGotoKeys } from "./use-goto-keys";

function press(key: string) {
  return new KeyboardEvent("keydown", { key });
}

describe("useGotoKeys", () => {
  it("fires 'top' after two consecutive 'g' presses", () => {
    const onGoto = vi.fn();
    const { result } = renderHook(() => useGotoKeys(true, onGoto));

    act(() => result.current(press("g")));
    act(() => result.current(press("g")));

    expect(onGoto).toHaveBeenCalledOnce();
    expect(onGoto).toHaveBeenCalledWith("top");
  });

  it("does not fire on a single 'g' press", () => {
    const onGoto = vi.fn();
    const { result } = renderHook(() => useGotoKeys(true, onGoto));

    act(() => result.current(press("g")));

    expect(onGoto).not.toHaveBeenCalled();
  });

  it("fires 'bottom' on 'G'", () => {
    const onGoto = vi.fn();
    const { result } = renderHook(() => useGotoKeys(true, onGoto));

    act(() => result.current(press("G")));

    expect(onGoto).toHaveBeenCalledOnce();
    expect(onGoto).toHaveBeenCalledWith("bottom");
  });

  it("consumes 'g' and 'G' but lets other keys fall through", () => {
    const onGoto = vi.fn();
    const { result } = renderHook(() => useGotoKeys(true, onGoto));

    act(() => {
      expect(result.current(press("g"))).toBe(true);
      expect(result.current(press("G"))).toBe(true);
      expect(result.current(press("j"))).toBe(false);
    });

    expect(onGoto).toHaveBeenCalledTimes(1);
  });

  it("disarms the pending 'g' when another key is pressed", () => {
    const onGoto = vi.fn();
    const { result } = renderHook(() => useGotoKeys(true, onGoto));

    act(() => result.current(press("g")));
    act(() => result.current(press("j")));
    act(() => result.current(press("g")));

    expect(onGoto).not.toHaveBeenCalled();

    act(() => result.current(press("g")));

    expect(onGoto).toHaveBeenCalledOnce();
  });

  it("resets the pending 'g' when deactivated", () => {
    const onGoto = vi.fn();
    const { result, rerender } = renderHook(
      ({ active }) => useGotoKeys(active, onGoto),
      { initialProps: { active: true } },
    );

    act(() => result.current(press("g")));
    act(() => rerender({ active: false }));
    act(() => result.current(press("g")));

    expect(onGoto).not.toHaveBeenCalled();
  });
});