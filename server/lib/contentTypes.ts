let cachedContentTypes: string[] = [];
let lastFetchedTime = 0;

export async function getAvailableContentTypes(): Promise<string[]> {
  const spaceId = process.env.CONTENTFUL_SPACE_ID || process.env.VITE_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN || process.env.VITE_CONTENTFUL_ACCESS_TOKEN;
  const envId = process.env.CONTENTFUL_ENVIRONMENT || process.env.VITE_CONTENTFUL_ENVIRONMENT || "master";

  if (!spaceId || !accessToken) {
    return [];
  }

  // Cache for 5 minutes
  if (cachedContentTypes.length > 0 && Date.now() - lastFetchedTime < 5 * 60 * 1000) {
    return cachedContentTypes;
  }

  try {
    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${envId}/content_types?access_token=${accessToken}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      cachedContentTypes = (data.items || []).map((item: any) => item.sys.id);
      lastFetchedTime = Date.now();
    }
  } catch (err) {
    console.warn("Failed to fetch Contentful content types, falling back to empty list:", err);
  }

  return cachedContentTypes;
}
