// src/components/Tabs.jsx
import { useRef } from "react";
import { X, Plus } from "lucide-react";

export default function Tabs({
  notes,
  activeTab,
  onSelectTab,
  onDeleteNote,
  onCreateNote,
  onReorderNotes,
}) {
  const dragId = useRef(null);
  const dragOverId = useRef(null);

  const handleDragStart = (e, id) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    dragOverId.current = id;
  };

  const handleDrop = () => {
    const from = dragId.current;
    const to = dragOverId.current;
    if (!from || !to || from === to) return;

    const reordered = [...notes];
    const fromIndex = reordered.findIndex((n) => n.id === from);
    const toIndex = reordered.findIndex((n) => n.id === to);
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    onReorderNotes(reordered);
    dragId.current = null;
    dragOverId.current = null;
  };

  const handleDragEnd = () => {
    dragId.current = null;
    dragOverId.current = null;
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this note?")) return;
    onDeleteNote(id);
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {notes.map((note) => (
        <div
          key={note.id}
          draggable
          onDragStart={(e) => handleDragStart(e, note.id)}
          onDragOver={(e) => handleDragOver(e, note.id)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-t cursor-pointer transition-colors select-none ${
            activeTab === note.id
              ? "bg-gray-900 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-650"
          }`}
          onClick={() => onSelectTab(note.id)}
        >
          <span className="text-sm whitespace-nowrap">{note.title}</span>
          <button
            onClick={(e) => handleDelete(e, note.id)}
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
