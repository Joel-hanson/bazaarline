/** Map peak dates to human crash names for well-known Indian market episodes. */
export function labelFall(peakDate: string, depthPct: number): string {
  const y = peakDate.slice(0, 4);
  const m = Number(peakDate.slice(5, 7));

  if (peakDate >= "2025-12-01" && peakDate <= "2026-02-28") {
    return "2026 correction";
  }
  if (peakDate >= "2024-08-01" && peakDate <= "2024-11-30") {
    return "2024–25 slide";
  }
  if (y === "2021" && m >= 9) return "2022 correction";
  if (y === "2020" || (y === "2019" && m >= 11)) return "Covid crash";
  if (y === "2008" || (y === "2007" && m >= 12) || y === "2009") {
    return "2008 global crisis";
  }
  if (y === "2010" || y === "2011") return "2011 European crisis";
  if (y === "2015" || y === "2016") return "2015–16 sell-off";
  if (y === "2018" && m >= 8) return "2018 IL&FS scare";
  if (y === "2018" && m <= 3) return "2018 Feb wobble";
  if (y === "2019") return "2019 mid-cycle dip";
  if (y === "2022" || y === "2023") return `${y} pullback`;
  if (y === "2023") return "2023 Oct dip";

  if (depthPct <= -40) return `${y} crash`;
  if (depthPct <= -15) return `${y} correction`;
  return `${y} slide`;
}

export function formatPct(value: number, digits = 1): string {
  const rounded = Number(value.toFixed(digits));
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toFixed(digits)}%`;
}

export function formatLevel(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: value >= 1000 ? 2 : 2,
  }).format(value);
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatRecovery(years: number | null, open: boolean, nowPct?: number | null): string {
  if (open) {
    const depth = nowPct != null ? `, ${formatPct(nowPct)}` : "";
    return `Not yet${depth}`;
  }
  if (years == null) return "—";
  if (years < 1 / 12) return "Under a month";
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    return `${months} month${months === 1 ? "" : "s"}`;
  }
  if (years < 1.5) return `${years.toFixed(1)} years`;
  return `${years.toFixed(1)} years`;
}
