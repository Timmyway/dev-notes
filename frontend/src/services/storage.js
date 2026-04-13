// storage.js
import { apiFetch, API_URL } from "./api";

export const StorageService = (token, onUnauthorized) => ({
  // GET /notes
  getAllNotes: () =>
    apiFetch("/notes", { method: "GET" }, token, onUnauthorized),

  // POST /notes
  saveAllNotes: (notes) =>
    apiFetch(
      "/notes",
      {
        method: "POST",
        body: JSON.stringify({ notes }),
      },
      token,
      onUnauthorized,
    ),

  // POST /export
  exportData: () =>
    apiFetch("/export", { method: "POST" }, token, onUnauthorized).then(
      (notes) => JSON.stringify(notes, null, 2),
    ),

  // POST /import
  importData: (jsonString) => {
    try {
      const notes = JSON.parse(jsonString);
      return apiFetch(
        "/import",
        {
          method: "POST",
          body: JSON.stringify(notes),
        },
        token,
        onUnauthorized,
      ).then(() => notes);
    } catch (error) {
      return Promise.reject(new Error("Invalid JSON format"));
    }
  },
});
