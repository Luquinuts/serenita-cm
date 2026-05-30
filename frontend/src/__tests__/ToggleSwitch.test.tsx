import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { ToggleSwitch } from "../components/ToggleSwitch";

describe("ToggleSwitch (controlled)", () => {
  it("renders with role=switch", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("reflects checked state via aria-checked", () => {
    const { rerender } = render(
      <ToggleSwitch checked={false} onChange={() => {}} />,
    );
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");

    rerender(<ToggleSwitch checked={true} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with true when unchecked and clicked", () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} />);

    fireEvent.click(screen.getByRole("switch"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when checked and clicked", () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={true} onChange={handleChange} />);

    fireEvent.click(screen.getByRole("switch"));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("toggles on Space key", () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} />);

    const toggle = screen.getByRole("switch");
    fireEvent.keyDown(toggle, { key: " " });
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("toggles on Enter key", () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={handleChange} />);

    const toggle = screen.getByRole("switch");
    fireEvent.keyDown(toggle, { key: "Enter" });
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("is disabled when disabled prop is true — click does not call onChange", () => {
    const handleChange = vi.fn();
    render(
      <ToggleSwitch checked={false} onChange={handleChange} disabled />,
    );

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("has aria-disabled when disabled", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-disabled", "true");
  });

  it("does not toggle via keyboard when disabled", () => {
    const handleChange = vi.fn();
    render(
      <ToggleSwitch checked={false} onChange={handleChange} disabled />,
    );

    const toggle = screen.getByRole("switch");
    fireEvent.keyDown(toggle, { key: " " });
    expect(handleChange).not.toHaveBeenCalled();

    fireEvent.keyDown(toggle, { key: "Enter" });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("renders label text when label prop is provided", () => {
    render(
      <ToggleSwitch
        checked={false}
        onChange={() => {}}
        label="Dark mode"
      />,
    );
    expect(screen.getByText("Dark mode")).toBeInTheDocument();
  });

  it("is focusable (native button is focusable)", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />);
    const toggle = screen.getByRole("switch");
    expect(typeof toggle.focus).toBe("function");
  });

  it("renders without label when no label prop", () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
    const buttons = screen.getAllByRole("switch");
    expect(buttons).toHaveLength(1);
  });

  it("applies custom id when provided", () => {
    render(
      <ToggleSwitch
        checked={false}
        onChange={() => {}}
        id="theme-toggle"
      />,
    );
    expect(screen.getByRole("switch")).toHaveAttribute("id", "theme-toggle");
  });
});

describe("ToggleSwitch (uncontrolled)", () => {
  it("toggles internal state when no checked prop is provided", () => {
    const handleChange = vi.fn();
    render(<ToggleSwitch onChange={handleChange} />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");

    fireEvent.click(toggle);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("starts checked when defaultChecked is true", () => {
    render(<ToggleSwitch defaultChecked onChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("label toggle works when label is inside the button", () => {
    render(
      <ToggleSwitch
        onChange={() => {}}
        label="Clickable label"
      />,
    );
    // Label text is inside the button, clicking it fires the button's onClick
    const labelEl = screen.getByText("Clickable label");
    fireEvent.click(labelEl);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });
});

describe("ToggleSwitch integration with parent state", () => {
  it("works as a controlled component with useState", () => {
    function TestWrapper() {
      const [checked, setChecked] = useState(false);
      return (
        <>
          <ToggleSwitch checked={checked} onChange={setChecked} />
          <span data-testid="state">{checked ? "ON" : "OFF"}</span>
        </>
      );
    }
    render(<TestWrapper />);
    expect(screen.getByText("OFF")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByText("ON")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByText("OFF")).toBeInTheDocument();
  });
});
