import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AiAssistantSection } from "../sections/AiAssistantSection";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function pendingPromise() {
  return new Promise<never>(() => {});
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("AiAssistantSection provider toggles", () => {
  it("renders ToggleSwitch for each provider", () => {
    mockFetch.mockReturnValue(pendingPromise());

    render(<AiAssistantSection accessToken="test-token" />);

    const toggles = screen.getAllByRole("switch");
    expect(toggles).toHaveLength(2);
    expect(toggles[0]).toHaveAccessibleName("OpenAI");
    expect(toggles[1]).toHaveAccessibleName("Gemini");
  });

  it("starts with OpenAI selected (checked) and Gemini unchecked", () => {
    mockFetch.mockReturnValue(pendingPromise());

    render(<AiAssistantSection accessToken="test-token" />);

    const toggles = screen.getAllByRole("switch");
    expect(toggles[0]).toBeChecked();
    expect(toggles[1]).not.toBeChecked();
  });

  it("switches provider to Gemini when clicking its toggle", () => {
    mockFetch.mockReturnValue(pendingPromise());

    render(<AiAssistantSection accessToken="test-token" />);

    const toggles = screen.getAllByRole("switch");
    fireEvent.click(toggles[1]); // Click Gemini toggle

    expect(toggles[0]).not.toBeChecked();
    expect(toggles[1]).toBeChecked();
  });

  it("switches provider back to OpenAI when clicking its toggle", () => {
    mockFetch.mockReturnValue(pendingPromise());

    render(<AiAssistantSection accessToken="test-token" />);

    const toggles = screen.getAllByRole("switch");

    // Switch to Gemini first
    fireEvent.click(toggles[1]);
    expect(toggles[1]).toBeChecked();

    // Switch back to OpenAI
    fireEvent.click(toggles[0]);
    expect(toggles[0]).toBeChecked();
    expect(toggles[1]).not.toBeChecked();
  });

  it("submit button uses the selected provider", async () => {
    const aiStatus = {
      providers: {
        openai: { configured: true, model: "gpt-4o-mini" },
        gemini: { configured: true, model: "gemini-2.5-flash" },
      },
    };

    const queryResponse = { answer: "test", model: "gemini-2.5-flash", provider: "gemini" };

    // One status fetch + one query fetch
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => aiStatus })
      .mockResolvedValueOnce({ ok: true, json: async () => queryResponse });

    render(<AiAssistantSection accessToken="test-token" />);

    // Wait for status to load (meta text changes from "Verificando..." to model name)
    const meta = await screen.findByText(/gpt-4o-mini/);
    expect(meta).toBeInTheDocument();

    // Switch to Gemini via fireEvent
    const toggles = screen.getAllByRole("switch");
    fireEvent.click(toggles[1]);

    // Type a prompt
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "test prompt" } });

    // Use the form's requestSubmit() — triggers native form submit in jsdom
    const submitButton = screen.getByRole("button", { name: /consultar/i });
    expect(submitButton).not.toBeDisabled();

    const form = submitButton.closest("form")!;
    form.requestSubmit(submitButton as HTMLButtonElement);

    // The query call should have been made with the gemini provider
    await vi.waitFor(() => {
      expect(mockFetch.mock.calls.length).toBe(2);
    });

    // The query URL and body contain the right provider
    const queryCall = mockFetch.mock.calls[1];
    const queryUrl = queryCall[0] as string;
    expect(queryUrl).toContain("/api/ai/query");
    expect(JSON.parse(queryCall[1].body as string).provider).toBe("gemini");
  });
});
