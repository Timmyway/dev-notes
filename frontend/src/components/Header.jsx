// src/components/Header.jsx
import { useState } from "react";
import { Code, Download, Search, Upload } from "lucide-react";

export default function Header({
  saving,
  onLogout,
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  exportNotes,
  fileInputRef,
  importNotes,
}) {  
  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-400" />
          <h1 className="text-lg font-semibold">DevNotes</h1>
        </div>

        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-green-400">Saving...</span>}

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-700 rounded"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={exportNotes}
            className="p-2 hover:bg-gray-700 rounded"
            title="Export"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-700 rounded"
            title="Import"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="p-2 hover:bg-gray-700 rounded text-red-400 text-xs"
            title="Logout"
          >
            Logout
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importNotes}
            className="hidden"
          />
        </div>
      </div>

      {showSearch && (
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>
      )}
    </>
  );
}