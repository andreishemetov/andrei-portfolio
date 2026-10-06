import { notion } from './notion';

export type ProfileSection =
  | 'Hero'
  | 'What I Do'
  | 'Principles'
  | 'Stories'
  | 'Experience'
  | 'Writing'
  | 'About'
  | 'CTA';

export interface ProfileItem {
  id: string;
  name: string;
  section: ProfileSection;
  order: number;
  enabled: boolean;
  blocks: ProfileBlock[];
  slug: string;
}

export interface ProfileBlock {
    id: string;
    type: string;
    text: string;
  }

  async function getPageBlocks(pageId: string): Promise<ProfileBlock[]> {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
  
    return response.results
      .filter((block: any) => 'type' in block)
      .map((block: any) => {
        const content = block[block.type];
  
        const text =
          content?.rich_text
            ?.map((item: any) => item.plain_text)
            .join('') ?? '';
  
        return {
          id: block.id,
          type: block.type,
          text,
        };
      });
  }

export async function getProfileItems(): Promise<ProfileItem[]> {
    const dataSourceId = import.meta.env.NOTION_PROFILE_ID;
  
    if (!dataSourceId) {
      throw new Error('NOTION_PROFILE_ID is missing');
    }
  
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
    });
  
    const pages = response.results
  .filter(
    (item: any) =>
      item.object === 'page' &&
      item.properties.Enabled?.checkbox
  )
  .sort((a: any, b: any) => {
    const aOrder = a.properties.Order?.number ?? 999;
    const bOrder = b.properties.Order?.number ?? 999;

    return aOrder - bOrder;
  });

const items = await Promise.all(
  pages.map(async (page: any): Promise<ProfileItem> => {
    const props = page.properties;
    const blocks = await getPageBlocks(page.id);

    return {
      id: page.id,
      name: props.Name?.title?.[0]?.plain_text ?? '',
      slug: props.Slug?.rich_text?.[0]?.plain_text ?? '',
      section: props.Section?.select?.name ?? '',
      order: props.Order?.number ?? 999,
      enabled: props.Enabled?.checkbox ?? false,
      blocks,
    };
  })
);

return items;
  }