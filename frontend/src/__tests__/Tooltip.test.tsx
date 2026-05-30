import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tooltip } from "../components/Tooltip";

describe("Tooltip", () => {
  it("renders tooltip label text in the DOM", () => {
    render(
      <Tooltip label="Filter by date">
        <button>Filter</button>
      </Tooltip>,
    );
    expect(screen.getByText("Filter by date")).toBeInTheDocument();
  });

  it("renders children inside the wrapper", () => {
    render(
      <Tooltip label="Help">
        <button>Click me</button>
      </Tooltip>,
    );
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("has aria-describedby on child pointing to tooltip element", () => {
    render(
      <Tooltip label="Help">
        <button>Click</button>
      </Tooltip>,
    );
    const tooltip = screen.getByRole("tooltip");
    const tooltipId = tooltip.getAttribute("id");
    expect(tooltipId).toBeTruthy();
    const button = screen.getByRole("button", { name: "Click" });
    expect(button).toHaveAttribute("aria-describedby", tooltipId!);
  });

  it("tooltip element has role='tooltip'", () => {
    render(
      <Tooltip label="Info">
        <span data-testid="trigger">Hover me</span>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("Info");
  });

  it("wraps content in container with data-tooltip attribute", () => {
    render(
      <Tooltip label="Delete">
        <button>X</button>
      </Tooltip>,
    );
    const tooltip = screen.getByRole("tooltip");
    const wrapper = tooltip.parentElement!;
    expect(wrapper).toHaveAttribute("data-tooltip", "Delete");
  });

  it("applies default tooltip-wrapper class with top positioning", () => {
    render(
      <Tooltip label="Help">
        <button>?</button>
      </Tooltip>,
    );
    const wrapper = screen.getByRole("tooltip").parentElement!;
    expect(wrapper.className).toBe("tooltip-wrapper");
  });

  it("applies correct position class for bottom", () => {
    render(
      <Tooltip label="Help" position="bottom">
        <button>?</button>
      </Tooltip>,
    );
    const wrapper = screen.getByRole("tooltip").parentElement!;
    expect(wrapper.className).toContain("tooltip-bottom");
  });

  it("applies correct position class for left", () => {
    render(
      <Tooltip label="Help" position="left">
        <button>?</button>
      </Tooltip>,
    );
    const wrapper = screen.getByRole("tooltip").parentElement!;
    expect(wrapper.className).toContain("tooltip-left");
  });

  it("applies correct position class for right", () => {
    render(
      <Tooltip label="Help" position="right">
        <button>?</button>
      </Tooltip>,
    );
    const wrapper = screen.getByRole("tooltip").parentElement!;
    expect(wrapper.className).toContain("tooltip-right");
  });

  it("tooltip content has tooltip-content class", () => {
    render(
      <Tooltip label="Visible">
        <button>Test</button>
      </Tooltip>,
    );
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.className).toContain("tooltip-content");
  });

  it("works with anchor element as child", () => {
    render(
      <Tooltip label="Visit profile">
        <a href="/profile">Profile</a>
      </Tooltip>,
    );
    const link = screen.getByRole("link", { name: "Profile" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("aria-describedby");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Visit profile");
  });

  it("works with div as child", () => {
    render(
      <Tooltip label="Section info">
        <div data-testid="section">Content</div>
      </Tooltip>,
    );
    const div = screen.getByTestId("section");
    expect(div).toBeInTheDocument();
    expect(div).toHaveAttribute("aria-describedby");
  });

  it("uses default 'top' position when position is undefined", () => {
    render(
      <Tooltip label="Default top">
        <button>Test</button>
      </Tooltip>,
    );
    const wrapper = screen.getByRole("tooltip").parentElement!;
    expect(wrapper.className).toBe("tooltip-wrapper");
    expect(wrapper.className).not.toContain("tooltip-bottom");
    expect(wrapper.className).not.toContain("tooltip-left");
    expect(wrapper.className).not.toContain("tooltip-right");
  });
});
