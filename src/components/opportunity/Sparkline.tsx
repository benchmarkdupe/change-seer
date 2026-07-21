export function Sparkline({ data, className = "", width = 84, height = 26, stroke = "currentColor" }: { data: number[]; className?: string; width?: number; height?: number; stroke?: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      <polyline fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" points={points} />
    </svg>
  );
}
