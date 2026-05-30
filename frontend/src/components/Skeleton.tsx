interface SkeletonProps {
  variant?: "text" | "rect" | "circle";
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const classes = ["skeleton", `skeleton--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} aria-hidden="true" style={style} />;
}
