// src/components/Editor.jsx
import MarkdownPreview from "./MarkdownPreview"; // optional: extract the preview too

export default function Editor({ activeNote, updateNote }) {
  if (!activeNote) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) =>
            updateNote(activeNote.id, { title: e.target.value })
          }
          className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
          placeholder="Note title..."
        />
        <select
          value={activeNote.mode}
          onChange={(e) =>
            updateNote(activeNote.id, { mode: e.target.value })
          }
          className="px-3 py-1 bg-gray-900 border border-gray-700 rounded focus:outline-none"
        >
          <option value="markdown">Markdown</option>
          <option value="code">Code</option>
          <option value="plain">Plain Text</option>
        </select>
      </div>

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor textarea */}
        <div className="flex-1 overflow-auto">
          <textarea
            value={activeNote.content}
            onChange={(e) =>
              updateNote(activeNote.id, { content: e.target.value })
            }
            className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
            placeholder="Start typing..."
            spellCheck={false}
            style={{ tabSize: 2 }}
          />
        </div>

        {/* Markdown preview */}
        {activeNote.mode === "markdown" && (
          <div className="flex-1 overflow-auto p-4 bg-gray-850 border-l border-gray-700">
            <MarkdownPreview content={activeNote.content} />
          </div>
        )}
      </div>
    </div>
  );
}