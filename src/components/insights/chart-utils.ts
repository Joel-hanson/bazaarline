/** Map a pointer position into an SVG viewBox coordinate space. */
export function clientToSvgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const local = point.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}

export function interpolatePct(
  points: { day: number; pct: number }[],
  day: number,
): number | null {
  if (points.length === 0) return null;
  if (day < points[0].day || day > points[points.length - 1].day) return null;

  let lo = 0;
  let hi = points.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (points[mid].day <= day) lo = mid;
    else hi = mid;
  }

  const a = points[lo];
  const b = points[hi];
  if (a.day === b.day) return a.pct;
  const t = (day - a.day) / (b.day - a.day);
  return a.pct + (b.pct - a.pct) * t;
}

export function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || 1;
  const step = Math.ceil(span / (count - 1) / 5) * 5 || 5;
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + 0.01; v += step) ticks.push(v);
  return ticks;
}
