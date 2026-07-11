import { fetchFromContentful } from "../lib/fetchContentful.ts";
import { resolveCoverUrl } from "../lib/imageResolver.ts";

export async function getCategories() {
  let categoriesData: any = { items: [], includes: {} };
  try {
    categoriesData = await fetchFromContentful("category");
  } catch (err: any) {
    console.warn("Contentful category query failed:", err.message);
  }

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
    console.warn("Contentful book query failed:", err.message);
  }

  const includes = {
    Asset: [
      ...(categoriesData.includes?.Asset || []),
      ...(reviewsData.includes?.Asset || []),
      ...(booksData.includes?.Asset || [])
    ],
    Entry: [
      ...(categoriesData.includes?.Entry || []),
      ...(reviewsData.includes?.Entry || []),
      ...(booksData.includes?.Entry || [])
    ]
  };

  const categoryMap = new Map<string, { id: string; title: string; books: any[] }>();

  // 1. Process explicit 'category' content type entries first
  (categoriesData.items || []).forEach((item: any) => {
    const fields = item.fields;
    const catId = item.sys.id;
    const catTitle = fields.title || fields.name || "Untitled Category";
    categoryMap.set(catId, { id: catId, title: catTitle, books: [] });
  });

  const allEntries = [...(reviewsData.items || []), ...(booksData.items || [])];
  
  const mappedBooks = allEntries.map((item: any) => {
    const fields = item.fields;
    const cover_url = resolveCoverUrl(fields, includes);
    return {
      id: item.sys.id,
      slug: fields.slug || undefined,
      title: fields.title || "Untitled",
      author: fields.author || "Unknown",
      rating: fields.rating ? Number(fields.rating) : 5,
      cover_url: cover_url,
      genre: fields.genre || "General",
      summary: fields.summary || fields.synopsis || fields.description || "",
      reviewText: fields.reviewText || ""
    };
  });

  // 1. First, populate books based on explicit references in Category content type to respect exact Contentful order
  (categoriesData.items || []).forEach((item: any) => {
    const fields = item.fields;
    const catId = item.sys.id;
    const bookRefs = fields.books || fields.reference || [];
    const catObj = categoryMap.get(catId);
    if (catObj) {
      bookRefs.forEach((ref: any) => {
        if (ref.sys && ref.sys.id) {
          const matchedBook = mappedBooks.find(b => b.id === ref.sys.id);
          if (matchedBook && !catObj.books.some(b => b.id === matchedBook.id)) {
            catObj.books.push(matchedBook);
          }
        }
      });
    }
  });

  // 2. Then, append any other books that reference this category on the book models but aren't in the references list
  allEntries.forEach((item: any) => {
    const fields = item.fields;
    const bookId = item.sys.id;
    const mappedBook = mappedBooks.find(b => b.id === bookId);
    if (!mappedBook) return;

    const checkCategoryField = (val: any) => {
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach(v => checkCategoryField(v));
      } else if (typeof val === "object" && val.sys && val.sys.id) {
        const catId = val.sys.id;
        if (categoryMap.has(catId)) {
          const catObj = categoryMap.get(catId)!;
          if (!catObj.books.some(b => b.id === bookId)) {
            catObj.books.push(mappedBook);
          }
        }
      }
    };

    checkCategoryField(fields.categories);
    checkCategoryField(fields.category);
    checkCategoryField(fields.categoryRef);
  });

  const categoriesList = Array.from(categoryMap.values()).filter(c => c.books.length > 0);
  return { isContentful: categoriesList.length > 0, data: categoriesList };
}

export async function getCharacters() {
  let charactersData: any = { items: [], includes: {} };
  let isContentfulConnected = false;
  try {
    charactersData = await fetchFromContentful("bookCharacter");
    isContentfulConnected = charactersData.items && charactersData.items.length > 0;
  } catch (err: any) {
    console.warn("Contentful bookCharacter query failed:", err.message);
  }

  const includes = {
    Asset: charactersData.includes?.Asset || [],
    Entry: charactersData.includes?.Entry || []
  };

  let mappedCharacters = (charactersData.items || []).map((item: any) => {
    const fields = item.fields;
    const imageUrl = resolveCoverUrl(fields, includes);
    return {
      id: item.sys.id,
      name: fields.name || "Unnamed Character",
      slug: fields.slug || "",
      bookId: fields.book?.sys?.id,
      role: fields.role || "supporting",
      description: fields.description || "",
      traits: Array.isArray(fields.traits) ? fields.traits : [],
      reactions: fields.reactions || { love: 0, insightful: 0, agree: 0, bookmark: 0 },
      imageUrl: imageUrl
    };
  });

  if (mappedCharacters.length === 0) {
    mappedCharacters = [
      {
        id: "paul-atreides",
        name: "Paul Atreides",
        slug: "paul-atreides",
        bookId: "dune",
        role: "protagonist",
        description: "The young heir to House Atreides who becomes the mysterious messiah Muad'Dib on the desert planet of Arrakis, balancing prescient destiny against tragedy.",
        traits: ["Prescient", "Charismatic", "Tragic", "Leader"],
        reactions: { love: 145, insightful: 98, agree: 52, bookmark: 40 },
        imageUrl: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=400"
      },
      {
        id: "the-librarian",
        name: "The Librarian",
        slug: "the-librarian",
        bookId: "library-of-babel",
        role: "supporting",
        description: "An unnamed wanderer of the infinite hexagonal library, dedicating their life to searching for the mythical 'Man of the Book' who has read the catalog of all catalogs.",
        traits: ["Melancholy", "Mystical", "Obsessive", "Philosophical"],
        reactions: { love: 84, insightful: 122, agree: 31, bookmark: 65 },
        imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400"
      },
      {
        id: "daniel-sempere",
        name: "Daniel Sempere",
        slug: "daniel-sempere",
        bookId: "shadow-of-the-wind",
        role: "protagonist",
        description: "The son of an antiquarian book dealer in post-war Barcelona, whose destiny becomes inextricably bound to the mysterious author Julian Carax after selecting his book from the Cemetery of Forgotten Books.",
        traits: ["Curious", "Loyal", "Romantic", "Tenacious"],
        reactions: { love: 112, insightful: 67, agree: 24, bookmark: 88 },
        imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400"
      },
      {
        id: "balthazar",
        name: "Balthazar",
        slug: "balthazar",
        bookId: "foucaults-pendulum",
        role: "deuteragonist",
        description: "An esoteric scholar and veteran editor whose profound knowledge of the occult, Templars, and secret societies pulls him deep into a dangerous fictional conspiracy that turns deadly.",
        traits: ["Esoteric", "Skeptical", "Intellectual", "Obsessive"],
        reactions: { love: 73, insightful: 115, agree: 19, bookmark: 54 },
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400"
      }
    ];
  }

  return { isContentful: isContentfulConnected, data: mappedCharacters };
}

export async function getOriginalBooks() {
  const data = await fetchFromContentful("originalBook");
  const includes = data.includes || {};
  return data.items.map((item: any) => {
    const fields = item.fields;
    const cover_url = resolveCoverUrl(fields, includes);
    
    let chapters = [];
    if (Array.isArray(fields.chapters)) {
      chapters = fields.chapters.map((chRef: any) => {
        if (chRef.sys && chRef.sys.type === 'Link' && includes.Entry) {
          const matchedChapter = includes.Entry.find((e: any) => e.sys.id === chRef.sys.id);
          if (matchedChapter) {
            const chapter_cover = resolveCoverUrl(matchedChapter.fields, includes);
            return {
              id: matchedChapter.sys.id,
              title: matchedChapter.fields.title || "Untitled Chapter",
              content: matchedChapter.fields.content || matchedChapter.fields.body || "",
              publishedAt: matchedChapter.sys.createdAt,
              image_url: chapter_cover || undefined
            };
          }
        }
        return {
          id: chRef.id || Math.random().toString(),
          title: chRef.title || "Untitled Chapter",
          content: chRef.content || "",
          publishedAt: chRef.publishedAt || new Date().toISOString(),
          image_url: chRef.imageUrl || chRef.image_url || chRef.image || undefined
        };
      });
    } else if (typeof fields.chapters === 'string') {
      try {
        const parsed = JSON.parse(fields.chapters);
        chapters = parsed.map((ch: any) => ({
          id: ch.id || Math.random().toString(),
          title: ch.title || "Untitled Chapter",
          content: ch.content || "",
          publishedAt: ch.publishedAt || new Date().toISOString(),
          image_url: ch.imageUrl || ch.image_url || ch.image || undefined
        }));
      } catch (_) {
        chapters = [{ id: "ch1", title: "Chapter 1", content: fields.chapters, publishedAt: item.sys.createdAt }];
      }
    }

    let origGenreStr = "Philosophical Fiction";
    if (Array.isArray(fields.genre)) {
      origGenreStr = fields.genre.filter(Boolean).join(", ");
    } else if (typeof fields.genre === "string") {
      origGenreStr = fields.genre;
    }

    return {
      id: item.sys.id,
      title: fields.title || "Untitled Manuscript",
      slug: typeof fields.slug === "string" ? fields.slug.trim() : undefined,
      author: fields.author || "Alexander",
      synopsis: fields.synopsis || fields.description || "Manuscript synopsis unspecified in Contentful.",
      genre: origGenreStr,
      coverColor: fields.coverColor || "burgundy",
      coverStyle: fields.coverStyle || "classic",
      cover_url: cover_url,
      chapters: chapters.length > 0 ? chapters : [{ id: "c1", title: "Chapter I: The Introduction", content: fields.content || "Under curation.", publishedAt: item.sys.createdAt }],
      createdAt: item.sys.createdAt
    };
  });
}
