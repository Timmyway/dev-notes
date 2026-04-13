// services/api.js
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8600";
export { API_URL };

/**
 * Helper to ensure we don't have double slashes when joining base URL and endpoint
 */
const joinUrl = (base, endpoint) => {
  return `${base.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
};

export const apiFetch = async (
  endpoint,
  options = {},
  token,
  onUnauthorized,
) => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : joinUrl(API_URL, endpoint);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json", // Good practice for APIs
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // 401: Token expired or invalid
    // 403: Token valid but lacks permissions
    if ([401, 403].includes(response.status)) {
      sessionStorage.removeItem("devnotes_token");

      if (onUnauthorized) {
        onUnauthorized();
      } else {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }

    const errorData = await response
      .json()
      .catch(() => ({ message: "API Error" }));
    throw new Error(
      errorData.error || errorData.message || "Something went wrong",
    );
  }

  return response.json();
};
