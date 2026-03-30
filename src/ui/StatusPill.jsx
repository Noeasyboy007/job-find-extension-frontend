import { formatJobStatusLabel } from "../utils/format";

export function StatusPill({ value }) {
  return (
    <span className={`status-pill status-${value || "default"}`}>
      {formatJobStatusLabel(value)}
    </span>
  );
}
