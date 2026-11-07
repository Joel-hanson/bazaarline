import type { InsightsPayload } from "@/lib/market/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ComparisonTable({ data }: { data: InsightsPayload }) {
  return (
    <div className="table-scroll">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Index</TableHead>
            <TableHead>Below record now</TableHead>
            <TableHead>Past falls</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.comparisonRows.map((row) => (
            <TableRow key={row.index}>
              <TableCell className="font-medium">{row.index}</TableCell>
              <TableCell>{row.belowRecordNow}</TableCell>
              <TableCell className="text-muted-copy">{row.pastFalls}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function RecoveryTable({ data }: { data: InsightsPayload }) {
  return (
    <div className="table-scroll">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Crash</TableHead>
            <TableHead>Nifty 50</TableHead>
            <TableHead>Sensex</TableHead>
            <TableHead>Bank Nifty</TableHead>
            <TableHead>Nifty IT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.recoveryRows.map((row) => (
            <TableRow key={row.crash}>
              <TableCell className="font-medium">{row.crash}</TableCell>
              <TableCell className="tabular-nums">{row.nifty}</TableCell>
              <TableCell className="tabular-nums">{row.sensex}</TableCell>
              <TableCell className="tabular-nums">{row.bankNifty}</TableCell>
              <TableCell className="tabular-nums">{row.niftyIt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
