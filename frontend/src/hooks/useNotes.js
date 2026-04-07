import { useState, useEffect, useRef } from "react";
import { StorageService } from "../services/storage";

export const useNotes = (token, onUnauthorized) => {
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef(null);

  const service = StorageService(token, () => {
    // Called when API returns 401/403
    setNotes([]);
    setActiveTab(null);
    setLoading(false); // stop loading immediately
    onUnauthorized?.(); // triggers App to remove token
  });

  const loadNotes = async () => {
    setLoading(true);
    try {
      const loadedNotes = await service.getAllNotes();
      if (loadedNotes.length) {
        setNotes(loadedNotes);
        setActiveTab(loadedNotes[0].id);
      } else {
        const welcomeNote = {
          id: Date.now(),
          title: "Welcome",
          content:
            "# Welcome to DevNotes\n\nStart typing to create your notes!",
          mode: "markdown",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setNotes([welcomeNote]);
        setActiveTab(welcomeNote.id);
        await service.saveAllNotes([welcomeNote]);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadNotes();
    else setLoading(false); // no token => stop loading
  }, [token]);

  const saveNotes = async (updatedNotes) => {
    setSaving(true);
    try {
      await service.saveAllNotes(updatedNotes);
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setTimeout(() => setSaving(false), 300);
    }
  };

  const debouncedSave = (updatedNotes) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveNotes(updatedNotes), 500);
  };

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Untitled",
      content: "",
      mode: "markdown",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    setActiveTab(newNote.id);
    saveNotes(updatedNotes);
  };

  const updateNote = (id, updates) => {
    const updatedNotes = notes.map((note) =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note,
    );
    setNotes(updatedNotes);
    if ("content" in updates) debouncedSave(updatedNotes);
    else saveNotes(updatedNotes);
  };

  const deleteNote = (id) => {
    if (notes.length === 1) return alert("Cannot delete the last note");
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    if (activeTab === id) setActiveTab(updatedNotes[0].id);
    saveNotes(updatedNotes);
  };

  const exportNotes = async () => {
    try {
      const data = await service.exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devnotes-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed: " + err.message);
    }
  };

  const importNotes = async (jsonString) => {
    try {
      const imported = await service.importData(jsonString);
      setNotes(imported);
      setActiveTab(imported[0]?.id);
      return imported;
    } catch (err) {
      console.error("Import failed:", err);
      alert("Import failed: " + err.message);
      return [];
    }
  };

  return {
    notes,
    activeTab,
    setActiveTab,
    saving,
    loading,
    createNote,
    updateNote,
    deleteNote,
    exportNotes,
    importNotes,
  };
};
