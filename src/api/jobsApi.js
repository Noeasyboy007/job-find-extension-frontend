import { apiRequest } from "./http";

export function getJobs() {
  return apiRequest("/jobs", { auth: true });
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

