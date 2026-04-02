import { apiRequest } from "./http";

function buildJobsQuery(params = {}) {
  const query = new URLSearchParams();
  const keys = ["page", "limit", "q", "title", "company_name", "source_platform"];

  for (const key of keys) {
    const raw = params[key];
    if (raw === undefined || raw === null) continue;
    const value = String(raw).trim();
    if (!value) continue;
    query.set(key, value);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export function getJobs(params = {}) {
  return apiRequest(`/jobs${buildJobsQuery(params)}`, { auth: true });
}

export function getJobById(id) {
  return apiRequest(`/jobs/${id}`, { auth: true });
}

export function createJobIntake(payload) {
  return apiRequest("/jobs/intake", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function updateJobStatus(id, status) {
  return apiRequest(`/jobs/${id}/status`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ status }),
  });
}

/** Re-queue AI structuring after a failed run (server worker processes the job). */
export function retryJobStructure(id) {
  return apiRequest(`/jobs/${id}/retry-structure`, {
    method: "POST",
    auth: true,
  });
}
