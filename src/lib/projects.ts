import { notion } from './notion';

export interface Project {
  id: string;
  name: string;
  slug: string;
  role: string;
  domain: string;
  featured: boolean;
  published: boolean;
  order: number;
  technologies: string[];
  cover: string;
}

export async function getProjects(): Promise<Project[]> {
  const dataSourceId = import.meta.env.NOTION_PROJECTS_ID;

  if (!dataSourceId) {
    throw new Error('NOTION_PROJECTS_ID is missing');
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
        role: props.Role?.rich_text?.[0]?.plain_text ?? '',
        domain: props.Domain?.select?.name ?? '',
        featured: props.Featured?.checkbox ?? false,
        published: props.Published?.checkbox ?? false,
        order: props.Order?.number ?? 999,
        technologies:
          props.Technologies?.multi_select?.map(
            (item: any) => item.name
          ) ?? [],
          cover:
          props['Cover Image']?.rich_text?.[0]?.plain_text ?? '',
      };
    })
    .sort((a, b) => a.order - b.order);
}

export async function getFeaturedProjects() {
  const projects = await getProjects();

  return projects.filter((project) => project.featured);
}

export async function getProjectBySlug(
    slug: string
  ): Promise<Project | undefined> {
    const projects = await getProjects();
  
    return projects.find(
      (project) => project.slug === slug
    );
  }
