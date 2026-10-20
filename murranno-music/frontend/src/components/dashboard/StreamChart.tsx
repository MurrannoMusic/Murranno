import { useState } from 'react';
import type { StreamDataPoint } from '@/hooks/useStreamAnalytics';

const W = 640, H = 180, LEFT = 36, RIGHT = 12, TOP = 16, BOTTOM = 28;
const compact = (n: number) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}m` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}k` : `${Math.round(n)}`);

/** Same chart as the Expo app: every reported day, hover/tap or arrow keys reveal a value. */
export function StreamChart({ data, loading = false }: { data: StreamDataPoint[]; loading?: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  if (loading) return <div className="h-[200px] grid place-items-center text-sm text-muted-foreground">Loading stream history…</div>;
  if (!data.length) return <div className="h-[200px] grid place-items-center text-sm text-muted-foreground">No stream reports for this period yet.</div>;

  const plotW = W - LEFT - RIGHT, plotH = H - TOP - BOTTOM;
  const ceiling = Math.max(4, Math.ceil(Math.max(...data.map((d) => d.streams), 1) / 4) * 4);
  const times = data.map((d) => new Date(d.date).getTime());
  const span = times[times.length - 1] - times[0];
  const x = (i: number) => LEFT + (span > 0 ? (times[i] - times[0]) / span : 0.5) * plotW;
  const y = (n: number) => TOP + plotH * (1 - n / ceiling);
  const point = selected !== null ? data[selected] : undefined;
  const inspect = (clientX: number, rect: DOMRect) => {
    const target = times[0] + Math.max(0, Math.min(1, ((clientX - rect.left) / rect.width * W - LEFT) / plotW)) * span;
    setSelected(times.reduce((best, t, i) => (Math.abs(t - target) < Math.abs(times[best] - target) ? i : best), 0));
  };
  const labels = [...new Set([0, Math.floor((data.length - 1) / 2), data.length - 1])];

  return (
    <div>
      <p aria-live="polite" className="min-h-6 text-right text-xs text-muted-foreground">
        {point ? `${point.label} · ${point.streams.toLocaleString()} streams` : 'Hover the chart to inspect a day'}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        role="slider"
        tabIndex={0}
        aria-label="Daily stream chart"
        aria-valuemin={0}
        aria-valuemax={data.length - 1}
        aria-valuenow={selected ?? 0}
        aria-valuetext={point ? `${point.label}: ${point.streams} streams` : `${data.length} reported days`}
        onPointerMove={(e) => inspect(e.clientX, e.currentTarget.getBoundingClientRect())}
        onPointerDown={(e) => inspect(e.clientX, e.currentTarget.getBoundingClientRect())}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setSelected(null)}
        onKeyDown={(e) => {
          const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (step) setSelected((i) => Math.max(0, Math.min(data.length - 1, (i ?? -step) + step)));
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={LEFT} x2={W - RIGHT} y1={y((ceiling * i) / 4)} y2={y((ceiling * i) / 4)} className="stroke-border" strokeDasharray={i ? '3 5' : undefined} />
            <text x={LEFT - 8} y={y((ceiling * i) / 4) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{compact((ceiling * i) / 4)}</text>
          </g>
        ))}
        {data.length > 1 ? (
          <path d={data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.streams)}`).join(' ')} className="stroke-primary" strokeWidth={2.5} fill="none" />
        ) : (
          <circle cx={x(0)} cy={y(data[0].streams)} r={4} className="fill-primary" />
        )}
        {point && selected !== null && (
          <>
            <line x1={x(selected)} x2={x(selected)} y1={TOP} y2={H - BOTTOM} className="stroke-muted-foreground" strokeDasharray="3 4" />
            <circle cx={x(selected)} cy={y(point.streams)} r={5} className="fill-primary stroke-background" strokeWidth={2} />
          </>
        )}
        {labels.map((i, pos) => (
          <text key={i} x={x(i)} y={H - 6} className="fill-muted-foreground text-[10px]" textAnchor={labels.length === 1 ? 'middle' : pos === 0 ? 'start' : pos === labels.length - 1 ? 'end' : 'middle'}>
            {data[i].label}
          </text>
        ))}
      </svg>
    </div>
  );
}
