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
  if (y === "2021" && m >= 9) return "2022";
  if (y === "2020" || (y === "2019" && m >= 11)) return "Covid";
  if (
    (y === "2008" || (y === "2007" && m >= 12) || y === "2009") &&
    depthPct <= -15
  ) {
    return "2008 crisis";
  }
  if (y === "2010" || y === "2011") return "2011";
  if (y === "2015" || y === "2016") return "2015–16";
  if (y === "2018" && m >= 8) return "2018 IL&FS";
  if (y === "2018" && m <= 3) return "2018 Feb";
  if (y === "2019") return "2019";
  if (y === "2022" || y === "2023") return `${y}`;
  if (y === "2023") return "2023";

  if (depthPct <= -40) return `${y}`;
  if (depthPct <= -15) return `${y}`;
  return `${y}`;
}

export function formatPct(value: number, digits = 1): string {
  const rounded = Number(value.toFixed(digits));
  // Kadoa-style minus sign for negatives
  if (rounded < 0) return `−${Math.abs(rounded).toFixed(digits)}%`;
  if (rounded > 0) return `+${rounded.toFixed(digits)}%`;
  return `${rounded.toFixed(digits)}%`;
}

export function formatLevel(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
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

export function formatRecovery(
  years: number | null,
  open: boolean,
  nowPct?: number | null,
): string {
  if (open) {
    // Match Kadoa: "Not yet" in the falls table; recovery matrix may add depth
    if (nowPct != null) return `Not yet: ${formatPct(nowPct)}`;
    return "Not yet";
  }
  if (years == null) return "—";
  if (years < 1 / 12) return "Under a month";
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    return `${months} month${months === 1 ? "" : "s"}`;
  }
  return `${years.toFixed(1)} years`;
}
