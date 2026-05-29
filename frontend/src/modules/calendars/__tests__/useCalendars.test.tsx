import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCalendars } from "../hooks/useCalendars";
import type { CalendarFilters } from "../types";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const defaultFilters: CalendarFilters = {
  month: 5,
  year: 2026,
  status: "all",
  query: "",
};

const accessToken = "test-token";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useCalendars", () => {
  it("loadCalendars must NOT include month/year in URL params", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ calendars: [] }),
    });

    renderHook(() => useCalendars(accessToken, defaultFilters));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain("/api/calendars");
    expect(callUrl).not.toContain("month=");
    expect(callUrl).not.toContain("year=");
  });

  it("createCalendar must NOT include month/year in POST body", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "cal-1",
        name: "Test",
        month: null,
        year: null,
      }),
    });

    const { result } = renderHook(() => useCalendars(accessToken, defaultFilters));

    // Wait for initial load to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    mockFetch.mockClear();

    await result.current.createCalendar("Nuevo calendario");

    const callUrl = mockFetch.mock.calls[0][0] as string;
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);

    expect(callUrl).toContain("/api/calendars");
    expect(callBody).not.toHaveProperty("month");
    expect(callBody).not.toHaveProperty("year");
    expect(callBody).toHaveProperty("name", "Nuevo calendario");
  });

  it("loadCalendars still sends status and query when set", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ calendars: [] }),
    });

    const filtersWithQuery: CalendarFilters = {
      ...defaultFilters,
      status: "active",
      query: "Mayo",
    };

    renderHook(() => useCalendars(accessToken, filtersWithQuery));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain("status=active");
    expect(callUrl).toContain("q=Mayo");
    expect(callUrl).not.toContain("month=");
    expect(callUrl).not.toContain("year=");
  });
});
