import { fetchFromContentful } from "../lib/fetchContentful.js";
import { resolveCoverUrl } from "../lib/imageResolver.js";
import { normalizeQuotes } from "../lib/quoteNormalizer.js";

export async function getReviews() {
  let reviewsData: any = { items: [], includes: {} };
  try {
    reviewsData = await fetchFromContentful("bookReview");
  } catch (err: any) {
    console.warn("Contentful bookReview query failed:", err.message);
  }

  let booksData: any = { items: [], includes: {} };
  try {
    booksData = await fetchFromContentful("book");
  } catch (err: any) {
    console.warn("Contentful book query failed (Model 6 may not be configured in CMS yet):", err.message);
  }

  const includes = {
    Asset: [...(reviewsData.includes?.Asset || []), ...(booksData.includes?.Asset || [])],
    Entry: [...(reviewsData.includes?.Entry || []), ...(booksData.includes?.Entry || [])]
  };

  const reviewItems = (reviewsData.items || []).map((item: any) => {
    const fields = item.fields;
    const cover_url = resolveCoverUrl(fields, includes);

    // Map rich themes/tags formats cleanly
    let rawThemes: any[] = [];
    if (Array.isArray(fields.themes)) {
      rawThemes = fields.themes;
    } else if (Array.isArray(fields.tags)) {
      rawThemes = fields.tags;
    } else if (typeof fields.themes === "string") {
      rawThemes = [fields.themes];
    } else if (typeof fields.tags === "string") {
      rawThemes = [fields.tags];
    } else if (typeof fields.theme === "string") {
      rawThemes = [fields.theme];
    } else {
      rawThemes = [fields.genre || fields.category || "General"];
    }

    const flatThemes: any[] = [];
    rawThemes.forEach((item: any) => {
      if (!item) return;
      if (Array.isArray(item)) {
        flatThemes.push(...item);
        return;
      }
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              flatThemes.push(...parsed);
              return;
            }
          } catch (_) {}
        }
        flatThemes.push(...trimmed.split(/[,;|]+/).map(t => t.trim()));
      } else {
        flatThemes.push(item);
      }
    });

    const normalizedThemes: string[] = flatThemes
      .filter(Boolean)
      .map((t: any) => {
        if (typeof t === "string") return t.trim();
        if (typeof t === "object") {
          if (t.fields && typeof t.fields.name === "string") return t.fields.name.trim();
          if (t.fields && typeof t.fields.title === "string") return t.fields.title.trim();
          if (typeof t.name === "string") return t.name.trim();
          if (typeof t.title === "string") return t.title.trim();
          try {
            return JSON.stringify(t);
          } catch (_) {
            return String(t);
          }
        }
        return String(t);
      })
      .filter((v, i, self) => v && self.indexOf(v) === i);

    // Parse and map "genre" cleanly
    let genreStr = "General Literature";
    if (Array.isArray(fields.genre)) {
      genreStr = fields.genre.filter(Boolean).join(", ");
    } else if (typeof fields.genre === "string") {
      genreStr = fields.genre;
    } else if (fields.category) {
      genreStr = Array.isArray(fields.category) ? fields.category.filter(Boolean).join(", ") : String(fields.category);
    }

    return {
      id: item.sys.id,
      slug: typeof fields.slug === "string" ? fields.slug.trim() : undefined,
      title: fields.title || "Untitled Critique",
      author: fields.author || "Unknown",
      rating: Number(fields.rating) || 5,
      reviewDate: new Date(item.sys.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      genre: genreStr,
      coverColor: fields.coverColor || "burgundy",
      coverStyle: fields.coverStyle || "classic",
      cover_url: cover_url,
      summary: fields.summary || fields.synopsis || "Review excerpt not found in CMS.",
      reviewText: fields.reviewText || fields.content || "No review analysis is published yet for this entry.",
      themes: normalizedThemes,
      quotes: normalizeQuotes(fields.quotes || fields.memorableQuotes || fields.memorable_quotes),
      is_top_pick: fields.isTopPick !== undefined ? !!fields.isTopPick : (fields.is_top_pick !== undefined ? !!fields.is_top_pick : false),
      top_pick_order: fields.topPickOrder || fields.top_pick_order || undefined,
      is_bottom_shelf: fields.isBottomShelf !== undefined ? !!fields.isBottomShelf : (fields.is_bottom_shelf !== undefined ? !!fields.is_bottom_shelf : false),
      is_discovery: fields.isDiscovery !== undefined ? !!fields.isDiscovery : (fields.is_discovery !== undefined ? !!fields.is_discovery : (fields.isHighlight !== undefined ? !!fields.isHighlight : false)),
      is_featured: fields.isFeatured !== undefined ? !!fields.isFeatured : (fields.is_featured !== undefined ? !!fields.is_featured : (fields.isDiscovery !== undefined ? !!fields.isDiscovery : (fields.is_discovery !== undefined ? !!fields.is_discovery : (fields.isHighlight !== undefined ? !!fields.isHighlight : false)))),
      bookNumber: fields.bookNumber || fields.seriesNumber || fields.volume || fields.volumeNumber || undefined,
      series: fields.series || undefined,
      is_series_review: (() => {
        const hasSeriesFlag = fields.isSeriesReview !== undefined ? !!fields.isSeriesReview : (fields.is_series_review !== undefined ? !!fields.is_series_review : false);
        const source = Array.isArray(fields.seriesBooks) ? fields.seriesBooks : (Array.isArray(fields.series_books) ? fields.series_books : []);
        return hasSeriesFlag || source.length > 0;
      })(),
      series_books: (() => {
        const source = Array.isArray(fields.seriesBooks) ? fields.seriesBooks : (Array.isArray(fields.series_books) ? fields.series_books : []);
        return source.map((sRef: any) => {
          if (sRef && sRef.sys && sRef.sys.type === "Link" && includes.Entry) {
            const matched = includes.Entry.find((e: any) => e.sys.id === sRef.sys.id);
            if (matched && matched.fields) {
              const cover_url = resolveCoverUrl(matched.fields, includes);
              return {
                id: matched.sys.id,
                title: matched.fields.title || "Untitled",
                author: matched.fields.author || undefined,
                rating: matched.fields.rating !== undefined ? Number(matched.fields.rating) : undefined,
                slug: matched.fields.slug || undefined,
                synopsis: matched.fields.synopsis || matched.fields.summary || matched.fields.description || undefined,
                coverUrl: cover_url || undefined,
                hasReview: matched.sys.contentType?.sys?.id === 'bookReview' || matched.fields.reviewText !== undefined,
                bookNumber: matched.fields.bookNumber || matched.fields.seriesNumber || matched.fields.volume || matched.fields.volumeNumber || undefined,
                genre: matched.fields.genre || matched.fields.category || undefined
              };
            }
          }
          if (sRef && sRef.fields) {
            const cover_url = resolveCoverUrl(sRef.fields, includes);
            return {
              id: sRef.sys?.id || Math.random().toString(),
              title: sRef.fields.title || "Untitled",
              author: sRef.fields.author || undefined,
              rating: sRef.fields.rating !== undefined ? Number(sRef.fields.rating) : undefined,
              slug: sRef.fields.slug || undefined,
              synopsis: sRef.fields.synopsis || sRef.fields.summary || sRef.fields.description || undefined,
              coverUrl: cover_url || undefined,
              hasReview: sRef.sys?.contentType?.sys?.id === 'bookReview' || sRef.fields.reviewText !== undefined,
              bookNumber: sRef.fields.bookNumber || sRef.fields.seriesNumber || sRef.fields.volume || sRef.fields.volumeNumber || undefined,
              genre: sRef.fields.genre || sRef.fields.category || undefined
            };
          }
          if (typeof sRef === "string") {
            return { title: sRef };
          }
          return null;
        }).filter(Boolean);
      })(),
      reactions: fields.reactions || { love: 0, insightful: 0, agree: 0, bookmark: 0 }
    };
  });

  const bookItems = (booksData.items || []).map((item: any) => {
    const fields = item.fields;
    const cover_url = resolveCoverUrl(fields, includes);

    // Map rich themes/tags formats cleanly
    let rawThemes: any[] = [];
    if (Array.isArray(fields.themes)) {
      rawThemes = fields.themes;
    } else if (Array.isArray(fields.tags)) {
      rawThemes = fields.tags;
    } else if (typeof fields.themes === "string") {
      rawThemes = [fields.themes];
    } else if (typeof fields.tags === "string") {
      rawThemes = [fields.tags];
    } else if (typeof fields.theme === "string") {
      rawThemes = [fields.theme];
    } else {
      rawThemes = [fields.genre || fields.category || "General"];
    }

    const flatThemes: any[] = [];
    rawThemes.forEach((item: any) => {
      if (!item) return;
      if (Array.isArray(item)) {
        flatThemes.push(...item);
        return;
      }
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              flatThemes.push(...parsed);
              return;
            }
          } catch (_) {}
        }
        flatThemes.push(...trimmed.split(/[,;|]+/).map(t => t.trim()));
      } else {
        flatThemes.push(item);
      }
    });

    const normalizedThemes: string[] = flatThemes
      .filter(Boolean)
      .map((t: any) => {
        if (typeof t === "string") return t.trim();
        if (typeof t === "object") {
          if (t.fields && typeof t.fields.name === "string") return t.fields.name.trim();
          if (t.fields && typeof t.fields.title === "string") return t.fields.title.trim();
          if (typeof t.name === "string") return t.name.trim();
          if (typeof t.title === "string") return t.title.trim();
          try {
            return JSON.stringify(t);
          } catch (_) {
            return String(t);
          }
        }
        return String(t);
      })
      .filter((v, i, self) => v && self.indexOf(v) === i);
    
    let genreStr = "General Literature";
    if (Array.isArray(fields.genre)) {
      genreStr = fields.genre.filter(Boolean).join(", ");
    } else if (typeof fields.genre === "string") {
      genreStr = fields.genre;
    } else if (fields.category) {
      genreStr = Array.isArray(fields.category) ? fields.category.filter(Boolean).join(", ") : String(fields.category);
    }

    return {
      id: item.sys.id,
      slug: typeof fields.slug === "string" ? fields.slug.trim() : undefined,
      title: fields.title || "Untitled Book",
      author: fields.author || "Unknown",
      rating: Number(fields.rating) || 5,
      reviewDate: new Date(item.sys.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      genre: genreStr,
      coverColor: fields.coverColor || "navy",
      coverStyle: fields.coverStyle || "minimalist",
      cover_url: cover_url,
      summary: fields.synopsis || fields.description || fields.summary || "Book profile & synopsis not published yet.",
      reviewText: fields.reviewText || fields.content || "", // No review analysis is published yet for this entry
      themes: normalizedThemes,
      quotes: normalizeQuotes(fields.quotes || fields.memorableQuotes || fields.memorable_quotes),
      is_top_pick: fields.isTopPick !== undefined ? !!fields.isTopPick : (fields.is_top_pick !== undefined ? !!fields.is_top_pick : false),
      top_pick_order: fields.topPickOrder || fields.top_pick_order || undefined,
      is_bottom_shelf: fields.isBottomShelf !== undefined ? !!fields.isBottomShelf : (fields.is_bottom_shelf !== undefined ? !!fields.is_bottom_shelf : false),
      is_discovery: fields.isDiscovery !== undefined ? !!fields.isDiscovery : (fields.is_discovery !== undefined ? !!fields.is_discovery : (fields.isHighlight !== undefined ? !!fields.isHighlight : false)),
      is_featured: fields.isFeatured !== undefined ? !!fields.isFeatured : (fields.is_featured !== undefined ? !!fields.is_featured : (fields.isDiscovery !== undefined ? !!fields.isDiscovery : (fields.is_discovery !== undefined ? !!fields.is_discovery : (fields.isHighlight !== undefined ? !!fields.isHighlight : false)))),
      series: fields.series || undefined,
      is_series_review: false,
      reactions: fields.reactions || { love: 0, insightful: 0, agree: 0, bookmark: 0 },
      bookNumber: fields.bookNumber || fields.seriesNumber || fields.volume || fields.volumeNumber || undefined
    };
  });

  return [...reviewItems, ...bookItems];
}
