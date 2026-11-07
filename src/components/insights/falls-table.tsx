import { formatDateLong, formatPct } from "@/lib/market/labels";
import type { FallEpisode } from "@/lib/market/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function backAtRecord(f: FallEpisode): string {
  if (f.open) return "Not yet";
  if (!f.recoveredDate || f.yearsToRecover == null) return "—";
  const years = f.yearsToRecover;
  let duration: string;
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    duration = `${months} month${months === 1 ? "" : "s"}`;
  } else {
    duration = `${years.toFixed(1)} years`;
  }
  return `${formatDateLong(f.recoveredDate)}, ${duration}`;
}

export function FallsTable({
  falls,
  highlightOpen = true,
}: {
  falls: FallEpisode[];
  highlightOpen?: boolean;
}) {
  const rows = [...falls]
    .filter((f) => f.depthPct <= -15 || f.open)
    .sort((a, b) => {
      if (a.open !== b.open) return a.open ? -1 : 1;
      return a.depthPct - b.depthPct;
    });

  return (
    <div className="table-scroll">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fall</TableHead>
            <TableHead>Record close</TableHead>
            <TableHead>Low</TableHead>
            <TableHead>Below record</TableHead>
            <TableHead>Trading days</TableHead>
            <TableHead>Back at record</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((f) => (
            <TableRow
              key={f.id}
              className={highlightOpen && f.open ? "row-current" : undefined}
            >
              <TableCell className="font-medium">
                {f.label}
                {f.open ? " · so far" : ""}
              </TableCell>
              <TableCell>{formatDateLong(f.peakDate)}</TableCell>
              <TableCell>
                {formatDateLong(f.lowDate)}
                {f.open ? " · so far" : ""}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatPct(f.depthPct)}
                {f.open && f.nowPct != null ? (
                  <span className="table-sub">
                    {" "}
                    now {formatPct(f.nowPct)}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="tabular-nums">
                {f.tradingDaysToLow}
                {f.open ? ` · ${f.tradingDaysToNow} so far` : ""}
              </TableCell>
              <TableCell>{backAtRecord(f)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
