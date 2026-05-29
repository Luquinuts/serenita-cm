import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CalendarSection } from "../components/CalendarSection";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockListResponse(calendars: unknown[]) {
  return {
    ok: true,
    json: async () => ({ calendars }),
  };
}

function mockDetailResponse(calendar: unknown) {
  return {
    ok: true,
    json: async () => ({ calendar, items: [] }),
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("CalendarSection", () => {
  it("renders CalendarCard with null month/year without crashing and shows name", async () => {
    const calendar = {
      id: "cal-1",
      organization_id: "org-1",
      user_id: null,
      name: "Calendario sin periodo",
      description: null,
      month: null,
      year: null,
      status: "active",
      metadata: {},
      created_at: "2026-05-29T00:00:00Z",
      updated_at: "2026-05-29T00:00:00Z",
    };

    mockFetch
      .mockResolvedValueOnce(mockListResponse([calendar]))
      .mockResolvedValueOnce(mockDetailResponse(calendar));

    render(<CalendarSection accessToken="test-token" />);

    // The calendar name must render without crash
    await waitFor(() => {
      const nameElements = screen.getAllByText("Calendario sin periodo");
      expect(nameElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows generic empty state message (not period-specific)", async () => {
    mockFetch
      .mockResolvedValueOnce(mockListResponse([]))
      .mockResolvedValueOnce(mockDetailResponse({}));

    render(<CalendarSection accessToken="test-token" />);

    await waitFor(() => {
      const emptyMsg = screen.queryByText(/para este periodo/i);
      expect(emptyMsg).not.toBeInTheDocument();
    });
  });
});
