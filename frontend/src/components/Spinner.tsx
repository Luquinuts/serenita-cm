type SpinnerSize = "sm" | "md" | "lg";

type SpinnerProps = {
  size?: SpinnerSize;
  label?: string;
  className?: string;
};

export function Spinner({ size = "md", label, className }: SpinnerProps) {
  const dimension = { sm: 16, md: 24, lg: 40 }[size];
  const borderWidth = { sm: 2, md: 3, lg: 4 }[size];

  return (
    <span
      className={`spinner${className ? ` ${className}` : ""}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderWidth: `${borderWidth}px`,
      }}
      role="status"
      aria-label={label}
    >
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
