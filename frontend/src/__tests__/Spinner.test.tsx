import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../components/Spinner";

describe("Spinner", () => {
  it("renders at default md size (24x24) when no size prop is given", () => {
    render(<Spinner />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveStyle({ width: "24px", height: "24px" });
  });

  it("renders at sm size (16x16)", () => {
    render(<Spinner size="sm" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveStyle({ width: "16px", height: "16px" });
  });

  it("renders at md size (24x24)", () => {
    render(<Spinner size="md" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveStyle({ width: "24px", height: "24px" });
  });

  it("renders at lg size (40x40)", () => {
    render(<Spinner size="lg" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveStyle({ width: "40px", height: "40px" });
  });

  it("renders label as aria-label and as sr-only span", () => {
    render(<Spinner label="Cargando calendarios" />);

    const spinner = screen.getByRole("status");
    expect(spinner).toHaveAttribute("aria-label", "Cargando calendarios");

    // The sr-only span should contain the label text
    expect(screen.getByText("Cargando calendarios")).toBeInTheDocument();
  });

  it("omits aria-label and sr-only span when no label is given", () => {
    render(<Spinner />);

    const spinner = screen.getByRole("status");
    expect(spinner).not.toHaveAttribute("aria-label");
    expect(spinner.textContent).toBe("");
  });

  it("merges custom className with spinner class", () => {
    render(<Spinner className="mx-auto" />);

    const spinner = screen.getByRole("status");
    expect(spinner.className).toContain("spinner");
    expect(spinner.className).toContain("mx-auto");
  });

  it("applies correct border width per size", () => {
    const { unmount } = render(<Spinner size="sm" />);
    expect(screen.getByRole("status")).toHaveStyle({ borderWidth: "2px" });
    unmount();

    render(<Spinner size="md" />);
    expect(screen.getByRole("status")).toHaveStyle({ borderWidth: "3px" });
  });

  it("applies lg border width (4px)", () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole("status")).toHaveStyle({ borderWidth: "4px" });
  });

  it("has role status for accessibility regardless of label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
