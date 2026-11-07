import {
  formatDateLong,
  formatLevel,
  formatPct,
  formatRecovery,
} from "@/lib/market/labels";
import type { FallEpisode } from "@/lib/market/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
              <TableCell>
                {formatDateLong(f.peakDate)}
                <span className="cell-sub">{formatLevel(f.peak)}</span>
              </TableCell>
              <TableCell>
                {f.open ? "So far" : formatDateLong(f.lowDate)}
                <span className="cell-sub">{formatLevel(f.low)}</span>
              </TableCell>
              <TableCell className="tabular-nums">
                {formatPct(f.open ? (f.nowPct ?? f.depthPct) : f.depthPct)}
                {f.open ? (
                  <span className="cell-sub">
                    trough {formatPct(f.depthPct)}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="tabular-nums">{f.tradingDaysToLow}</TableCell>
              <TableCell>
                {f.open
                  ? formatRecovery(null, true, f.nowPct)
                  : f.recoveredDate
                    ? `${formatDateLong(f.recoveredDate)}, ${formatRecovery(f.yearsToRecover, false)}`
                    : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
