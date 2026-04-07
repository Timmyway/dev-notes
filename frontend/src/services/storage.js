// storage.js
import { apiFetch, API_URL } from "./api";

export const StorageService = (token, onUnauthorized) => ({
  getAllNotes: () =>
    apiFetch(`${API_URL}?action=getAllNotes`, {}, token, onUnauthorized),
  saveAllNotes: (notes) =>
    apiFetch(
      `${API_URL}?action=saveAllNotes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      },
      token,
      onUnauthorized,
    ),
  exportData: () =>
    apiFetch(`${API_URL}?action=exportData`, {}, token, onUnauthorized).then(
      (notes) => JSON.stringify(notes, null, 2),
    ),
  importData: (jsonString) => {
    const notes = JSON.parse(jsonString);
    return apiFetch(
      `${API_URL}?action=importData`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notes),
      },
      token,
      onUnauthorized,
    ).then(() => notes);
  },
});
