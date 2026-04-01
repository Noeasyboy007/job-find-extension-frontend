import { apiRequest } from "./http";

export function getApplyProfile() {
  return apiRequest("/user-apply-profile", { auth: true });
}

/**
 * @param {object} data
 */
export function upsertApplyProfile(data) {
  return apiRequest("/user-apply-profile", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
}
