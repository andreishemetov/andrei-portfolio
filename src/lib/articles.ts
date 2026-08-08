import { notion } from './notion';

export interface Article {
  id: string;
  name: string;
  slug: string;
  description: string;
  publishedDate: string;
  featured: boolean;
  order: number;
  tags: string[];
  externalUrl: string;
}

export async function getArticles(): Promise<Article[]> {
  const dataSourceId = import.meta.env.NOTION_ARTICLES_ID;

  if (!dataSourceId) {
    throw new Error('NOTION_ARTICLES_ID is missing');
  }

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
  });

  return response.results
    .filter((item: any) =>
      item.object === 'page' &&
      item.properties.Published?.checkbox
    )
    .map((page: any) => {
      const props = page.properties;

      return {
        id: page.id,
        name: props.Name?.title?.[0]?.plain_text ?? '',
        slug: props.Slug?.rich_text?.[0]?.plain_text ?? '',
        description:
          props.Description?.rich_text?.[0]?.plain_text ?? '',
        publishedDate:
          props['Published Date']?.date?.start ?? '',
        featured: props.Featured?.checkbox ?? false,
        order: props.Order?.number ?? 999,
        tags:
          props.Tags?.multi_select?.map(
            (item: any) => item.name
          ) ?? [],
        externalUrl:
          props['External URL']?.url ?? '',
      };
    })
    .sort((a, b) => a.order - b.order);
}