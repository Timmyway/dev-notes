import React, { useState, useRef } from "react";
import Login from "./components/Login";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import Editor from "./components/Editor";
import { useNotes } from "./hooks/useNotes";

const App = () => {
  const [token, setToken] = useState(
    sessionStorage.getItem("devnotes_token") || "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const fileInputRef = useRef(null);

  const {
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
  } = useNotes(token, () => {
    alert("Token invalid, please login again!");
    sessionStorage.removeItem("devnotes_token");
    setToken("");
  });

  const handleLogin = (enteredToken) => {
    sessionStorage.setItem("devnotes_token", enteredToken);
    setToken(enteredToken);
  };

  const handleLogout = () => {
    if (!confirm("Are you sure you want to logout?")) return;
    sessionStorage.removeItem("devnotes_token");
    setToken("");
  };

  if (!token) return <Login onLogin={handleLogin} />;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  if (!notes.length) {
    // Prevent rendering editor/tabs if no notes loaded
    return null;
  }

  const activeNote = notes.find((n) => n.id === activeTab);

  const filteredNotes = searchQuery
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : notes;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <Header
        saving={saving}
        onLogout={handleLogout}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        exportNotes={exportNotes}
        fileInputRef={fileInputRef}
        importNotes={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (ev) => {
            await importNotes(ev.target.result);
            alert("Imported!");
          };
          reader.readAsText(file);
        }}
        saving={saving}
      />

      <Tabs
        notes={filteredNotes}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onDeleteNote={deleteNote}
        onCreateNote={createNote}
      />

      <Editor activeNote={activeNote} updateNote={updateNote} />
    </div>
  );
};

export default App;
