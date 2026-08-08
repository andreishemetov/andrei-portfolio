import { notion } from './notion';

export interface Experience {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  order: number;
}

export async function getExperience(): Promise<Experience[]> {
  const dataSourceId = import.meta.env.NOTION_EXPERIENCE_ID;

  if (!dataSourceId) {
    throw new Error('NOTION_EXPERIENCE_ID is missing');
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
        role: props.Role?.rich_text?.[0]?.plain_text ?? '',
        startDate: props['Start Date']?.date?.start ?? '',
        endDate: props['End Date']?.date?.start ?? '',
        current: props.Current?.checkbox ?? false,
        location: props.Location?.rich_text?.[0]?.plain_text ?? '',
        order: props.Order?.number ?? 999,
      };
    })
    .sort((a, b) => a.order - b.order);
}