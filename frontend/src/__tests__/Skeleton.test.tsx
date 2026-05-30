import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "../components/Skeleton";

describe("Skeleton", () => {
  it("renders a div with aria-hidden='true'", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.tagName).toBe("DIV");
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders with default variant 'text' when no variant prop given", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("skeleton");
    expect(el.className).toContain("skeleton--text");
  });

  it("renders with 'rect' variant class", () => {
    const { container } = render(<Skeleton variant="rect" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("skeleton");
    expect(el.className).toContain("skeleton--rect");
  });

  it("renders with 'circle' variant class", () => {
    const { container } = render(<Skeleton variant="circle" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("skeleton");
    expect(el.className).toContain("skeleton--circle");
  });

  it("applies custom width via inline style", () => {
    const { container } = render(<Skeleton width="80px" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("80px");
  });

  it("applies custom height via inline style", () => {
    const { container } = render(<Skeleton height="60px" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe("60px");
  });

  it("applies custom width and height simultaneously", () => {
    const { container } = render(
      <Skeleton width="120px" height="120px" />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("120px");
  });

  it("merges custom className with skeleton classes", () => {
    const { container } = render(
      <Skeleton className="mx-auto my-custom" />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("skeleton");
    expect(el.className).toContain("mx-auto");
    expect(el.className).toContain("my-custom");
  });

  it("has no text content — purely visual placeholder", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.textContent).toBe("");
  });
});
