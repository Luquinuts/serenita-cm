import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePageTransition } from "../hooks/usePageTransition";

afterEach(() => {
  vi.useRealTimers();
});

describe("usePageTransition", () => {
  it("starts with no transition active", () => {
    const { result } = renderHook(() => usePageTransition("reports"));

    expect(result.current.isEntering).toBe(false);
    expect(result.current.isExiting).toBe(false);
    expect(result.current.isTransitioning).toBe(false);
  });

  it("sets isExiting when section changes and the rest of transition completes", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      (section: string) => usePageTransition(section),
      { initialProps: "reports" },
    );

    // Initial: no transition
    expect(result.current.isTransitioning).toBe(false);

    // Trigger section change
    rerender("history");

    // Immediately after change: exiting should be true
    expect(result.current.isExiting).toBe(true);
    expect(result.current.isEntering).toBe(false);
    expect(result.current.isTransitioning).toBe(true);

    // After 150ms: exit completes, enter starts
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isExiting).toBe(false);
    expect(result.current.isEntering).toBe(true);
    expect(result.current.isTransitioning).toBe(true);

    // After another 200ms: enter completes, back to idle
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isEntering).toBe(false);
    expect(result.current.isExiting).toBe(false);
    expect(result.current.isTransitioning).toBe(false);
  });

  it("restarts transition when section changes during an active transition", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      (section: string) => usePageTransition(section),
      { initialProps: "reports" },
    );

    // Trigger first transition
    rerender("history");
    expect(result.current.isExiting).toBe(true);

    // Advance 100ms into exit
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Still exiting
    expect(result.current.isExiting).toBe(true);

    // Trigger NEW section change before first completes
    rerender("calendar");

    // Should restart exit phase for new section
    expect(result.current.isExiting).toBe(true);
    expect(result.current.isEntering).toBe(false);

    // Advance the full exit (150ms from the NEW change)
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isExiting).toBe(false);
    expect(result.current.isEntering).toBe(true);

    // Complete enter phase
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isTransitioning).toBe(false);
  });

  it("does not trigger transition on initial render", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePageTransition("reports"));

    expect(result.current.isTransitioning).toBe(false);

    // Advance time — no timers should fire
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isTransitioning).toBe(false);
  });
});
