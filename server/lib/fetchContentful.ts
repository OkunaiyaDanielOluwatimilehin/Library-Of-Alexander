import { getAvailableContentTypes } from "./contentTypes.ts";

export async function fetchFromContentful(contentType: string) {
  const spaceId = process.env.CONTENTFUL_SPACE_ID || process.env.VITE_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN || process.env.VITE_CONTENTFUL_ACCESS_TOKEN;
  const envId = process.env.CONTENTFUL_ENVIRONMENT || process.env.VITE_CONTENTFUL_ENVIRONMENT || "master";

  if (!spaceId || !accessToken) {
    throw new Error("Contentful credentials are not configured in system settings.");
  }

  // Pre-validate that the requested content type is actually available to prevent 400 status code errors from Contentful
  const availableTypes = await getAvailableContentTypes();
  if (availableTypes.length > 0 && !availableTypes.includes(contentType)) {
    return { items: [], includes: {} };
  }

  // Include=2 allows resolving child link nodes (e.g. chapters linked inside originalBook)
  const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${envId}/entries?access_token=${accessToken}&content_type=${contentType}&include=2`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Contentful delivery network request failed with status: ${response.status}`);
  }
  return await response.json();
}
