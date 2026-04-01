import { apiRequest } from "./http";

/** @param {number} jobId */
export function discoverJobContacts(jobId) {
  return apiRequest(`/contacts/discover/${jobId}`, { method: "POST", auth: true });
}

/** @param {number} jobId */
export function getJobContacts(jobId) {
  return apiRequest(`/contacts?job_id=${jobId}`, { auth: true });
}
