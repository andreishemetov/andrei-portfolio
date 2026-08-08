import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: import.meta.env.NOTION_TOKEN,
});

export async function getPageBlocks(pageId: string) {
  const blocks = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
      start_cursor: cursor,
    });

    blocks.push(...response.results);

    cursor = response.has_more
      ? response.next_cursor ?? undefined
      : undefined;

  } while (cursor);

  return blocks;
}