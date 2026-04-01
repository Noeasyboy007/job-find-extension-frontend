import { apiRequest } from "./http";

/**
 * @param {number} jobId
 * @param {'recruiter'|'founder'|'connection_request'} type
 * @param {number|null} [contactId] — optional: link to a discovered contact for personalised message
 */
export function generateOutreach(jobId, type, contactId) {
  const body = contactId ? { jobId, type, contactId } : { jobId, type };
  return apiRequest("/outreach/generate", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

/** @param {number} jobId */
export function getOutreachList(jobId) {
  return apiRequest(`/outreach?job_id=${jobId}`, { auth: true });
}

/** @param {number} id */
export function getOutreach(id) {
  return apiRequest(`/outreach/${id}`, { auth: true });
}

/**
 * @param {number} id
 * @param {{ content?: string, status?: string }} updates
 */
export function updateOutreach(id, updates) {
  return apiRequest(`/outreach/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(updates),
  });
}
