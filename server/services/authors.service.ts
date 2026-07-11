import { fetchFromContentful } from "../lib/fetchContentful.ts";
import { resolveCoverUrl } from "../lib/imageResolver.ts";

function mapAuthorItems(data: any) {
  if (!data || !data.items || data.items.length === 0) {
    return [];
  }

  const includes = data.includes || {};
  return data.items.map((item: any) => {
    const fields = item.fields;
    let image_url = undefined;
    if (fields.image && fields.image.sys && includes.Asset) {
      const matchedAsset = includes.Asset.find((a: any) => a.sys.id === fields.image.sys.id);
      if (matchedAsset && matchedAsset.fields && matchedAsset.fields.file) {
        image_url = matchedAsset.fields.file.url;
        if (image_url && !image_url.startsWith("http")) {
          image_url = `https:${image_url}`;
        }
      }
    } else if (typeof fields.imageUrl === 'string') {
      image_url = fields.imageUrl;
    } else if (typeof fields.image_url === 'string') {
      image_url = fields.image_url;
    }

    const isSpotlightVal = fields.isSpotlight !== undefined ? fields.isSpotlight : (fields.is_spotlight !== undefined ? fields.is_spotlight : fields.spotlight);
    const isSpotlight = isSpotlightVal === true || 
                        isSpotlightVal === "true" ||
                        isSpotlightVal === "yes" ||
                        isSpotlightVal === "Yes" ||
                        isSpotlightVal === "YES" ||
                        isSpotlightVal === "1" ||
                        isSpotlightVal === 1 ||
                        false;

    return {
      id: item.sys.id,
      name: fields.name || "Unknown Author",
      slug: typeof fields.slug === "string" ? fields.slug.trim() : undefined,
      bio: fields.bio || "",
      isSpotlight: isSpotlight,
      notable_works: Array.isArray(fields.notableWorks)
        ? fields.notableWorks.map((work: any) => {
            if (work && typeof work === "object") {
              if (work.sys && work.sys.type === "Link" && includes.Entry) {
                const matchedEntry = includes.Entry.find((e: any) => e.sys.id === work.sys.id);
                if (matchedEntry && matchedEntry.fields) {
                  const webFields = matchedEntry.fields;
                  let origGenreStr = "Philosophical Fiction";
                  if (Array.isArray(webFields.genre)) {
                    origGenreStr = webFields.genre.filter(Boolean).join(", ");
                  } else if (typeof webFields.genre === "string") {
                    origGenreStr = webFields.genre;
                  }
                  const resolvedCover = resolveCoverUrl(webFields, includes);
                  return {
                    id: matchedEntry.sys.id,
                    title: webFields.title || "Untitled Manuscript",
                    slug: typeof webFields.slug === "string" ? webFields.slug.trim() : undefined,
                    author: webFields.author || fields.name || "Alexander",
                    synopsis: webFields.synopsis || webFields.description || "Manuscript synopsis unspecified in Contentful.",
                    genre: origGenreStr,
                    coverColor: webFields.coverColor || "burgundy",
                    coverStyle: webFields.coverStyle || "classic",
                    rating: typeof webFields.rating === "number" ? webFields.rating : 5,
                    bookNumber: webFields.bookNumber || "",
                    cover_url: resolvedCover
                  };
                }
              }
              if (work.fields) {
                const webFields = work.fields;
                const resolvedCover = resolveCoverUrl(webFields, includes);
                return {
                  id: work.sys?.id || Math.random().toString(),
                  title: webFields.title || "Untitled Manuscript",
                  author: webFields.author || fields.name || "Alexander",
                  synopsis: webFields.synopsis || webFields.description || "",
                  genre: Array.isArray(webFields.genre) ? webFields.genre.join(", ") : (webFields.genre || "Literature"),
                  coverColor: webFields.coverColor || "burgundy",
                  coverStyle: webFields.coverStyle || "classic",
                  rating: typeof webFields.rating === "number" ? webFields.rating : 5,
                  bookNumber: webFields.bookNumber || "",
                  cover_url: resolvedCover
                };
              }
            }
            return work;
          })
        : (typeof fields.notableWorks === "string" ? fields.notableWorks.split(",").map((s: string) => s.trim()) : []),
      spotlight_quote: fields.spotlightQuote || fields.quote || "",
      image_url: image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
      website_url: fields.websiteUrl || fields.website || "",
      socials_url: fields.socialsUrl || fields.socials || "",
      social_media_url: fields.socialMediaUrl || fields.social_media_url || fields.socialMediaURL || fields.social_media_url || "",
      socialMediaUrl: fields.socialMediaUrl || fields.social_media_url || fields.socialMediaURL || fields.social_media_url || "",
      buy_books_url: fields.buyBooksUrl || fields.whereToGetBooks || "",
      twitter_url: fields.twitterUrl || fields.twitter_url || fields.twitter || "",
      instagram_url: fields.instagramUrl || fields.instagram_url || fields.instagram || "",
      facebook_url: fields.facebookUrl || fields.facebook_url || fields.facebook || "",
      linkedin_url: fields.linkedinUrl || fields.linkedin_url || fields.linkedin || "",
      social_media_handle: fields.socialMediaHandle || fields.social_media_handle || fields.handle || fields.socialHandle || "",
      socialMediaHandle: fields.socialMediaHandle || fields.social_media_handle || fields.handle || fields.socialHandle || "",
      did_you_know: fields.didYouKnow || fields.did_you_know || "",
      fun_facts: Array.isArray(fields.funFacts) 
        ? fields.funFacts 
        : (Array.isArray(fields.fun_facts) 
            ? fields.fun_facts 
            : (typeof fields.funFacts === "string" 
                ? fields.funFacts.split("\n").map((s: string) => s.trim()).filter(Boolean) 
                : (typeof fields.fun_facts === "string" 
                    ? fields.fun_facts.split("\n").map((s: string) => s.trim()).filter(Boolean)
                    : [])))
    };
  });
}

export async function getAuthorSpotlight() {
  let data: any = null;
  try {
    data = await fetchFromContentful("author");
  } catch (err: any) {
    console.warn("Could not query 'author' Contentful model:", err.message);
  }

  if (!data || !data.items || data.items.length === 0) {
    try {
      data = await fetchFromContentful("authorSpotlight");
    } catch (err: any) {
      console.warn("Could not query 'authorSpotlight' Contentful model:", err.message);
    }
  }

  if (!data || !data.items || data.items.length === 0) {
    return { isContentful: false, data: null };
  }

  const items = mapAuthorItems(data);
  const selectedSpotlight = items.find((item: any) => item.isSpotlight) || items[0] || null;
  return { isContentful: true, data: selectedSpotlight };
}

export async function getAuthors() {
  let data: any = null;
  try {
    data = await fetchFromContentful("author");
  } catch (err: any) {
    console.warn("Could not query 'author' Contentful model:", err.message);
  }

  if (!data || !data.items || data.items.length === 0) {
    try {
      data = await fetchFromContentful("authorSpotlight");
    } catch (err: any) {
      console.warn("Could not query 'authorSpotlight' Contentful model:", err.message);
    }
  }

  if (!data || !data.items || data.items.length === 0) {
    return { isContentful: false, data: [] };
  }

  const items = mapAuthorItems(data);
  return { isContentful: true, data: items };
}
