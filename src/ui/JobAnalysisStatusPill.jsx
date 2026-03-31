import { formatJobAnalysisStatusLabel } from "../utils/format";

export function JobAnalysisStatusPill({ value }) {
  return (
    <span className={`status-pill status-${value || "default"}`}>
      {formatJobAnalysisStatusLabel(value)}
    </span>
  );
}
