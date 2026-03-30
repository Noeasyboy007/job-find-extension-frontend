export function StatusPill({ value }) {
  return <span className={`status-pill status-${value || "default"}`}>{value || "unknown"}</span>;
}

