import { Client } from '@notionhq/client';

const notionToken = import.meta.env.NOTION_TOKEN;

if (!notionToken) {
  throw new Error('NOTION_TOKEN is missing');
}

export const notion = new Client({
  auth: notionToken,
});

export async function getPageBlocks(pageId: string): Promise<any[]> {
  const blocks: any[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
      start_cursor: cursor,
    });

    blocks.push(...response.results);

    cursor =
      response.has_more && response.next_cursor
        ? response.next_cursor
        : undefined;
  } while (cursor);

  return blocks;
}