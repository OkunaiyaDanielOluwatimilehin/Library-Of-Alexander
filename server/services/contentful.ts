import { fetchFromContentful } from "../lib/fetchContentful.js";
import { getAvailableContentTypes } from "../lib/contentTypes.js";

export const ContentfulService = {
  fetch: fetchFromContentful,
  getContentTypes: getAvailableContentTypes
};
