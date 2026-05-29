import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReportHistorySection } from "../sections/ReportHistorySection";

const { mockFrom, mockQuery } = vi.hoisted(() => {
  const queryFn = vi.fn();
  const fromFn = vi.fn(() => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => queryFn(),
        }),
      }),
    }),
  }));
  return { mockFrom: fromFn, mockQuery: queryFn };
});

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: mockFrom,
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("ReportHistorySection", () => {
  it("shows spinner during history loading", () => {
    // Make the query never resolve → isHistoryLoading stays true
    mockQuery.mockReturnValue(new Promise<never>(() => {}));

    render(<ReportHistorySection userId="test-user" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Buscando reportes guardados...");
  });

  it("renders report history when data loads", async () => {
    const records = [
      {
        id: "rep-1",
        title: "Mayo 2026",
        payload: {
          cuenta: "test-account",
          periodo: "mensual",
          plataforma: "Instagram",
          metricas: {},
          publicaciones: [],
          audiencia: {},
          insights: [],
          sugerencias: [],
        },
        created_at: "2026-05-01T00:00:00Z",
      },
    ];

    mockQuery.mockResolvedValue({ data: records, error: null });

    render(<ReportHistorySection userId="test-user" />);

    await waitFor(() => {
      expect(screen.getByText("Mayo 2026")).toBeInTheDocument();
    });
  });
});
