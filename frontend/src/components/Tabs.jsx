// src/components/Tabs.jsx
import { X, Plus } from "lucide-react";

export default function Tabs({
  notes,
  activeTab,
  onSelectTab,
  onDeleteNote,
  onCreateNote,
}) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-t cursor-pointer transition-colors ${
            activeTab === note.id
              ? "bg-gray-900 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-650"
          }`}
          onClick={() => onSelectTab(note.id)}
        >
          <span className="text-sm whitespace-nowrap">{note.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteNote(note.id);
            }}
            className="hover:text-red-400"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      <button
        onClick={onCreateNote}
        className="p-1.5 hover:bg-gray-700 rounded"
        title="New note"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}