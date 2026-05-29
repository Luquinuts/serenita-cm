import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectionsSection } from "../sections/ConnectionsSection";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function pendingPromise() {
  return new Promise<never>(() => {});
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("ConnectionsSection", () => {
  it("shows centered spinner with text during loading state", () => {
    // First fetch (loadConnections) hangs → isLoading stays true
    // Second fetch (loadAiStatus) also hangs
    mockFetch.mockReturnValue(pendingPromise());

    render(<ConnectionsSection accessToken="test-token" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Cargando conexiones...");
  });

  it("shows connection list when data loads", async () => {
    const connections = [
      {
        id: "conn-1",
        nombre_conexion: "Test Connection",
        plataforma: "instagram",
        provider_username: "testuser",
        token_expiration: null,
        status: "active",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];

    const aiStatus = {
      providers: {
        openai: { configured: true, model: "gpt-4o-mini" },
        gemini: { configured: false, model: "gemini-2.5-flash" },
      },
    };

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ connections }) })
      .mockResolvedValueOnce({ ok: true, json: async () => aiStatus });

    render(<ConnectionsSection accessToken="test-token" />);

    const name = await screen.findByText("Test Connection");
    expect(name).toBeInTheDocument();
  });
});
