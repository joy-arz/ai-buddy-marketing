// src/lib/formatMarkdown.ts

/**
 * Formats a string containing basic Markdown-like syntax into HTML.
 * Intended for simple formatting within a React component's innerHTML.
 * WARNING: This is NOT a full Markdown parser and does NOT sanitize HTML.
 * Only use with trusted input.
 */
export function formatMarkdownToHtml(text: string): string {
  let html = text;

  // 1. Convert headers (# H1, ## H2, ### H3)
  html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");

  // 2. Convert bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 3. Convert italics (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>"); // Handle underscores too

  // 4. Convert lists (1. Numbered, - Bullet)
  // Handle numbered lists first
  html = html.replace(/^\d+\.\s+(.*$)/gm, "<ol><li>$1</li></ol>");
  // Handle bullet lists
  html = html.replace(/^\-\s+(.*$)/gm, "<ul><li>$1</li></ul>");

  // 5. Convert horizontal rules (---)
  html = html.replace(/^\-{3,}$/gm, "<hr />");

  // 6. Convert blockquotes (>)
  html = html.replace(/^>\s+(.*$)/gm, "<blockquote>$1</blockquote>");

  // 7. Convert tables (simple format with |)
  // This is a basic table conversion, might not handle complex tables perfectly
  const tableRegex = /(?:^|\n)((?:\|[^\n]+\|\n?)+)(?=\n|$)/g;
  html = html.replace(tableRegex, (match) => {
    const rows = match.trim().split('\n');
    if (rows.length < 2) return match; // Need at least header and separator

    let tableHtml = '<table class="border-collapse w-full my-2"><tbody>';

    rows.forEach((row, index) => {
      const cells = row.split('|').filter(cell => cell.trim() !== ''); // Remove empty cells from start/end
      if (cells.length === 0) return; // Skip empty rows

      if (index === 1) {
        // Assume the second row is the separator (e.g., |---|---|)
        // We just skip it for now, but we could use it for alignment
        return;
      }

      tableHtml += '<tr>';
      cells.forEach(cell => {
        // Determine if it's a header row (first row after potential separator)
        const tag = index === 0 ? 'th' : 'td';
        tableHtml += `<${tag} class="border border-neutral-700 p-2">${cell.trim()}</${tag}>`;
      });
      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  // 8. Convert line breaks (ensure paragraphs)
  // Replace multiple newlines with paragraph breaks
  html = html.replace(/\n\s*\n/g, "</p><p>");
  // Replace single newlines with <br> (within paragraphs)
  html = html.replace(/\n/g, "<br>");

  // Wrap the whole thing in a paragraph if it's not already wrapped in block elements
  // This handles plain text blocks that don't start with headers/lists/etc.
  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<table') && !html.startsWith('<blockquote') && !html.startsWith('<hr')) {
     html = `<p>${html}</p>`;
  } else if (html.startsWith('<p>') && !html.endsWith('</p>')) {
     // If it starts with <p> but doesn't end with </p>, wrap the rest
     html = `${html}</p>`;
  }


  return html;
}