import { apiRequest } from "./http";

export function signup(payload) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe() {
  return apiRequest("/auth/me", { auth: true });
}

export function verifyEmail(token) {
  return apiRequest(`/auth/verify?token=${encodeURIComponent(token)}`, {
    method: "POST",
  });
}

export function resendVerification(payload) {
  return apiRequest("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(payload) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout(payload) {
  return apiRequest("/auth/logout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProfile(payload) {
  return apiRequest("/auth/profile", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

