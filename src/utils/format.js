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

