import { useId, Children, cloneElement, isValidElement } from "react";

interface TooltipProps {
  label: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

export function Tooltip({
  label,
  position = "top",
  children,
}: TooltipProps) {
  const tooltipId = useId();

  const className =
    position === "top"
      ? "tooltip-wrapper"
      : `tooltip-wrapper tooltip-${position}`;

  const child = Children.only(children);

  return (
    <div className={className} data-tooltip={label}>
      {isValidElement(child)
        ? cloneElement(
            child as React.ReactElement<{ "aria-describedby"?: string }>,
            { "aria-describedby": tooltipId },
          )
        : children}
      <span id={tooltipId} className="tooltip-content" role="tooltip">
        {label}
      </span>
    </div>
  );
}
