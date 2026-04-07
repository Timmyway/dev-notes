// services/api.js
export const API_URL = "http://localhost:8600/api.php";

export const apiFetch = async (url, options = {}, token, onUnauthorized) => {
  const response = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    if ([401, 403].includes(response.status)) {
      sessionStorage.removeItem("devnotes_token");
      onUnauthorized?.();
      throw new Error("Unauthorized");
    }
    const text = await response.text();
    throw new Error(text || "API error");
  }

  return response.json();
};