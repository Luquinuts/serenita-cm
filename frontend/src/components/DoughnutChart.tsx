import { parsePercentage } from "../utils/reportHelpers";

interface DoughnutChartProps {
  mujeres: string;
  hombres: string;
}

export function DoughnutChart({ mujeres, hombres }: DoughnutChartProps) {
  const women = parsePercentage(mujeres);
  const men = parsePercentage(hombres);
  const first = women || 0;
  const second = Math.max(0, 100 - first);
  const circumference = 2 * Math.PI * 44;
  const womenLength = (first / 100) * circumference;
  const menLength = (second / 100) * circumference;

  return (
    <svg className="gender-chart" viewBox="0 0 120 120" role="img" aria-label="Distribución de género">
      <circle cx="60" cy="60" r="44" fill="none" stroke="#d9ddd8" strokeWidth="18" />
      <circle
        cx="60"
        cy="60"
        r="44"
        fill="none"
        stroke="#e963b0"
        strokeWidth="18"
        strokeDasharray={`${womenLength} ${circumference - womenLength}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <circle
        cx="60"
        cy="60"
        r="44"
        fill="none"
        stroke="#2e8df6"
        strokeWidth="18"
        strokeDasharray={`${menLength} ${circumference - menLength}`}
        strokeDashoffset={-womenLength}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <circle cx="60" cy="60" r="25" fill="#f5f5f3" />
    </svg>
  );
}
