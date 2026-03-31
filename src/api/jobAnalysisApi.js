import { apiRequest } from "./http";

/**
 * @returns {Promise<import("../types.js").ApiResponse & { data: import("../types.js").JobAnalysis | null }>}
 */
export function getJobAnalysis(jobId) {
  return apiRequest(`/job-analysis/${jobId}`, { auth: true });
}

/**
 * @returns {Promise<import("../types.js").ApiResponse & { data: import("../types.js").JobAnalysis }>}
 */
export function analyzeJob(jobId) {
  return apiRequest(`/job-analysis/${jobId}/analyze`, {
    method: "POST",
    auth: true,
  });
}

/**
 * @returns {Promise<import("../types.js").ApiResponse & { data: import("../types.js").JobAnalysis }>}
 */
export function reanalyzeJob(jobId) {
  return apiRequest(`/job-analysis/reanalyze`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ jobId }),
  });
}
