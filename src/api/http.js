import { API_BASE_URL } from "../config";
import {
  clearSessionTokens,
  getAccessToken,
  getRefreshToken,
  setSessionTokens,
} from "./session";

async function parseResponseOrThrow(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.is_error) {
    const message =
      payload?.message ||
      (Array.isArray(payload?.message)
        ? payload.message.join(", ")
        : null) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Refresh token missing");
  }

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
    .then(parseResponseOrThrow)
    .then((response) => {
      const accessToken = response?.data?.accessToken;
      const nextRefreshToken = response?.data?.refreshToken;
      if (!accessToken || !nextRefreshToken) {
        throw new Error("Invalid refresh response");
      }
      setSessionTokens(accessToken, nextRefreshToken);
      return accessToken;
    })
    .catch((error) => {
      clearSessionTokens();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * @template T
 * @param {string} path
 * @param {RequestInit & { auth?: boolean, retryOn401?: boolean }} [options]
 * @returns {Promise<{is_error:boolean,status:number,message:string,data:T}>}
 */
export async function apiRequest(path, options = {}) {
  const { auth = false, retryOn401 = true, headers, ...rest } = options;
  const reqHeaders = new Headers(headers || {});

  const isFormData = rest.body instanceof FormData;
  if (!isFormData && !reqHeaders.has("Content-Type")) {
    reqHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      reqHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: reqHeaders,
  });

  if (auth && response.status === 401 && retryOn401) {
    await refreshAccessToken();
    const retriedHeaders = new Headers(headers || {});
    if (!isFormData && !retriedHeaders.has("Content-Type")) {
      retriedHeaders.set("Content-Type", "application/json");
    }
    const accessToken = getAccessToken();
    if (accessToken) {
      retriedHeaders.set("Authorization", `Bearer ${accessToken}`);
    }

    const retried = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: retriedHeaders,
    });
    return parseResponseOrThrow(retried);
  }

  return parseResponseOrThrow(response);
}

