import { fetchFromContentful } from "../lib/fetchContentful.ts";
import { getAvailableContentTypes } from "../lib/contentTypes.ts";

export const ContentfulService = {
  fetch: fetchFromContentful,
  getContentTypes: getAvailableContentTypes
};
