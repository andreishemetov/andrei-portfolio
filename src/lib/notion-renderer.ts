function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderRichText(items: any[] = []) {
  return items
    .map((item) => {
      let text = escapeHtml(item.plain_text ?? '');

      if (item.annotations?.code) {
        text = `<code>${text}</code>`;
      }

      if (item.annotations?.bold) {
        text = `<strong>${text}</strong>`;
      }

      if (item.annotations?.italic) {
        text = `<em>${text}</em>`;
      }

      if (item.annotations?.strikethrough) {
        text = `<s>${text}</s>`;
      }

      if (item.annotations?.underline) {
        text = `<u>${text}</u>`;
      }

      if (item.href) {
        const href = escapeHtml(item.href);

        text = `
          <a
            href="${href}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${text}
          </a>
        `;
      }

      return text;
    })
    .join('');
}

function renderBlock(block: any): string {
  const type = block.type;
  const data = block[type];

  switch (type) {
    case 'paragraph':
      return `<p>${renderRichText(data.rich_text)}</p>`;

    case 'heading_1':
      return `<h1>${renderRichText(data.rich_text)}</h1>`;

    case 'heading_2':
      return `<h2>${renderRichText(data.rich_text)}</h2>`;

    case 'heading_3':
      return `<h3>${renderRichText(data.rich_text)}</h3>`;

    case 'quote':
      return `
        <blockquote>
          ${renderRichText(data.rich_text)}
        </blockquote>
      `;

    case 'code': {
      const language = escapeHtml(data.language ?? '');

      return `
        <pre>
          <code data-language="${language}">
            ${renderRichText(data.rich_text)}
          </code>
        </pre>
      `;
    }

    case 'divider':
      return '<hr />';

    case 'callout':
      return `
        <aside class="notion-callout">
          ${renderRichText(data.rich_text)}
        </aside>
      `;

    default:
      return '';
  }
}

export function renderBlocks(blocks: any[]) {
  let html = '';
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listType) {
      html += `</${listType}>`;
      listType = null;
    }
  };

  for (const block of blocks) {

    if (block.type === 'bulleted_list_item') {

      if (listType !== 'ul') {
        closeList();

        html += '<ul>';
        listType = 'ul';
      }

      html += `
        <li>
          ${renderRichText(
            block.bulleted_list_item.rich_text
          )}
        </li>
      `;

      continue;
    }

    if (block.type === 'numbered_list_item') {

      if (listType !== 'ol') {
        closeList();

        html += '<ol>';
        listType = 'ol';
      }

      html += `
        <li>
          ${renderRichText(
            block.numbered_list_item.rich_text
          )}
        </li>
      `;

      continue;
    }

    closeList();

    html += renderBlock(block);
  }

  closeList();

  return html;
}