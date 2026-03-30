export function bytesToSize(bytes) {
  if (!bytes && bytes !== 0) return "Unknown";
  const kb = 1024;
  const mb = kb * 1024;
  if (bytes < kb) return `${bytes} B`;
  if (bytes < mb) return `${(bytes / kb).toFixed(1)} KB`;
  return `${(bytes / mb).toFixed(2)} MB`;
}

export function safeJsonParse(value, fallback) {
  if (!value?.trim()) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("Invalid JSON field");
  }
}

export function toTitleLabel(value) {
  if (value === null || value === undefined || value === "") return "Unknown";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

const JOB_SOURCE_LABELS = {
  well_found: "Wellfound",
  well_foeun: "Wellfound",
  career_page: "Career Page",
  carrer_page: "Career Page",
  naukri: "Naukri",
};

export function formatJobSourceLabel(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  const key = String(value).trim().toLowerCase();
  return JOB_SOURCE_LABELS[key] || toTitleLabel(key);
}

export function formatJobStatusLabel(value) {
  if (value === null || value === undefined || value === "") return "Unknown";
  return toTitleLabel(value);
}

export function formatDateTimeIST(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}
