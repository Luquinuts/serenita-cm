import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { z } from "zod";

describe("Smoke tests", () => {
  it("react renders a basic element", () => {
    render(
      <MemoryRouter>
        <div data-testid="smoke">Serenita CM</div>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("smoke")).toHaveTextContent("Serenita CM");
  });

  it("zod validates correctly", () => {
    const schema = z.object({ name: z.string() });
    expect(schema.safeParse({ name: "test" }).success).toBe(true);
    expect(schema.safeParse({ name: 123 }).success).toBe(false);
  });
});
