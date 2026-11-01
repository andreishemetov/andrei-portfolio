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
        const href = safeUrl(item.href);

        if (href) {
          const attributes = href.startsWith('mailto:')
            ? ''
            : ' target="_blank" rel="noopener noreferrer"';

          text = `<a href="${href}"${attributes}>${text}</a>`;
        }
      }

      return text;
    })
    .join('');
}

function safeUrl(value: string | null | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (
      url.protocol === 'https:' ||
      url.protocol === 'http:' ||
      url.protocol === 'mailto:'
    ) {
      return escapeHtml(url.toString());
    }
  } catch {
    return null;
  }

  return null;
}

function renderBlock(block: any): string {
  const type = block.type;
  const data = block[type];

  switch (type) {
    case 'paragraph':
      return `<p>${renderRichText(data.rich_text)}</p>`;

    case 'heading_1':
      return `<h2>${renderRichText(data.rich_text)}</h2>`;

    case 'heading_2':
      return `<h3>${renderRichText(data.rich_text)}</h3>`;

    case 'heading_3':
      return `<h4>${renderRichText(data.rich_text)}</h4>`;

    case 'quote':
      return `
        <blockquote>
          ${renderRichText(data.rich_text)}
        </blockquote>
      `;

    case 'code': {
  const language = escapeHtml(data.language ?? '');
  const code = (data.rich_text ?? [])
    .map((item: any) => escapeHtml(item.plain_text ?? ''))
    .join('');

  return `<pre><code data-language="${language}">${code}</code></pre>`;
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
