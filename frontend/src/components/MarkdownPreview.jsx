// src/components/MarkdownPreview.jsx
export default function MarkdownPreview({ content }) {
  const renderMarkdown = (text) => {
    let html = text;

    // Headers
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-bold mt-4 mb-2 text-blue-300">$1</h3>',
    );
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-bold mt-4 mb-2 text-blue-400">$1</h2>',
    );
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-bold mt-4 mb-2 text-blue-500">$1</h1>',
    );

    // Code blocks
    html = html.replace(
      /```([\s\S]*?)```/gim,
      '<pre class="bg-gray-900 p-3 rounded my-2 overflow-x-auto"><code class="text-green-400 text-sm">$1</code></pre>',
    );

    // Inline code
    html = html.replace(
      /`([^`]+)`/gim,
      '<code class="bg-gray-900 px-1.5 py-0.5 rounded text-green-400 text-sm">$1</code>',
    );

    // Bold
    html = html.replace(
      /\*\*([^*]+)\*\*/gim,
      '<strong class="font-bold text-white">$1</strong>',
    );

    // Italic
    html = html.replace(/\*([^*]+)\*/gim, '<em class="italic">$1</em>');

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>');

    // Line breaks
    html = html.replace(/\n/gim, "<br />");

    return html;
  };

  return (
    <div
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
