import { fetchFromContentful } from "../lib/fetchContentful.js";
import { resolveCoverUrl } from "../lib/imageResolver.js";

export async function getRankings() {
  let rankingsData: any = { items: [], includes: {} };
  try {
    rankingsData = await fetchFromContentful("rankingEntry");
  } catch (err: any) {
    console.warn("Contentful rankingEntry query failed:", err.message);
  }

  let rankingListsData: any = { items: [], includes: {} };
  try {
    rankingListsData = await fetchFromContentful("rankingList");
  } catch (err: any) {
    console.warn("Contentful rankingList query failed:", err.message);
  }

  const includes = {
    Asset: [
      ...(rankingsData.includes?.Asset || []),
      ...(rankingListsData.includes?.Asset || [])
    ],
    Entry: [
      ...(rankingsData.includes?.Entry || []),
      ...(rankingListsData.includes?.Entry || [])
    ]
  };

  // 1. Process legacy individual rankingEntry schema
  const rankingItems = (rankingsData.items || []).map((item: any) => {
    const fields = item.fields;
    let linkedBook: any = null;
    let matched: any = null;

    // Resolve reference to 'bookReview' or 'book'
    if (fields.book && fields.book.sys && fields.book.sys.type === "Link" && includes.Entry) {
      matched = includes.Entry.find((e: any) => e.sys.id === fields.book.sys.id);
      if (matched && matched.fields) {
        const cover_url = resolveCoverUrl(matched.fields, includes);
        linkedBook = {
          id: matched.sys.id,
          title: matched.fields.title,
          author: matched.fields.author,
          rating: matched.fields.rating,
          slug: matched.fields.slug,
          cover_url: cover_url,
          summary: matched.fields.summary || matched.fields.synopsis,
          genre: matched.fields.genre || matched.fields.category
        };
      }
    }

    const createdAt = item.sys?.createdAt || new Date().toISOString();
    const msDiff = Date.now() - new Date(createdAt).getTime();
    const daysDiff = Math.max(1, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
    const calculatedWeeks = Math.max(1, Math.ceil(daysDiff / 7));

    const titleLower = (fields.title || "").toLowerCase();
    const seasonLower = (fields.season || fields.timeline || "").toLowerCase();
    const isUnderdog = titleLower.includes("bottom") || titleLower.includes("shelf") ||
                       seasonLower.includes("bottom") || seasonLower.includes("shelf") ||
                       (linkedBook && linkedBook.rating && linkedBook.rating < 4.5);
    const listType = fields.listType || fields.category || (isUnderdog ? "bottom-shelf" : "top-picks");

    return {
      id: item.sys.id,
      bookId: linkedBook ? linkedBook.id : (fields.bookId || fields.book_id || undefined),
      book: linkedBook,
      rank: fields.rank !== undefined ? Number(fields.rank) : undefined,
      season: fields.season || fields.timeline || "weekly",
      listType: listType,
      weeksOnList: fields.weeksOnList !== undefined ? Number(fields.weeksOnList) : (fields.daysOnList !== undefined ? Math.round(Number(fields.daysOnList) / 7) : calculatedWeeks),
      itemType: "book"
    };
  }).filter((item: any) => item.book || item.bookId);

  // 2. Process robust list-based rankingList schema
  const rankingListItems: any[] = [];
  const extractedLists: any[] = [];
  (rankingListsData.items || []).forEach((listEntry: any) => {
    const lf = listEntry.fields;
    const listItemsRefs = lf.items || [];
    const season = lf.season || lf.timeline || "weekly";
    const listType = lf.listType || lf.list_type || "top-picks";
    const itemType = lf.itemType || lf.item_type || "book";
    const listId = listEntry.sys.id;
    const listTitle = lf.title || lf.name || `Ranking List #${listId.substring(0, 4)}`;
    const isMain = lf.isMain !== undefined ? !!lf.isMain : false;

    extractedLists.push({
      id: listId,
      title: listTitle,
      listType: listType,
      season: season,
      itemType: itemType,
      isMain: isMain
    });

    // Parse regular ranked items
    listItemsRefs.forEach((refItem: any, index: number) => {
      if (refItem.sys && refItem.sys.id && includes.Entry) {
        const matched = includes.Entry.find((e: any) => e.sys.id === refItem.sys.id);
        if (matched && matched.fields) {
          if (itemType === "book" || itemType === "bookReview") {
            const cover_url = resolveCoverUrl(matched.fields, includes);
            const linkedBook = {
              id: matched.sys.id,
              title: matched.fields.title,
              author: matched.fields.author,
              rating: matched.fields.rating ? Number(matched.fields.rating) : 5,
              slug: matched.fields.slug,
              cover_url: cover_url,
              summary: matched.fields.summary || matched.fields.synopsis,
              genre: matched.fields.genre || matched.fields.category
            };

            rankingListItems.push({
              id: `${listEntry.sys.id}_item_${refItem.sys.id}`,
              listId: listId,
              bookId: linkedBook.id,
              book: linkedBook,
              rank: index + 1, // Automatic index-based order forms the basis!
              season: season,
              listType: listType,
              weeksOnList: 1, // Default to 1 week initially
              itemType: "book"
            });
          } else if (itemType === "character" || itemType === "bookCharacter") {
            const charCover = resolveCoverUrl(matched.fields, includes);
            const linkedCharacter = {
              id: matched.sys.id,
              name: matched.fields.name,
              bookId: matched.fields.book?.sys?.id,
              role: matched.fields.role || "protagonist",
              description: matched.fields.description || matched.fields.biography || "",
              traits: Array.isArray(matched.fields.traits) ? matched.fields.traits : [],
              reactions: matched.fields.reactions || { love: 0, agreement: 0 },
              imageUrl: charCover
            };

            rankingListItems.push({
              id: `${listEntry.sys.id}_item_${refItem.sys.id}`,
              listId: listId,
              characterId: linkedCharacter.id,
              character: linkedCharacter,
              rank: index + 1, // Index order sets rank automatically!
              season: season,
              listType: listType,
              weeksOnList: 1,
              itemType: "character"
            });
          }
        }
      }
    });

    // Parse featuredItems reference section
    const featuredItemsRefs = lf.featuredItems || [];
    featuredItemsRefs.forEach((refItem: any, index: number) => {
      if (refItem.sys && refItem.sys.id && includes.Entry) {
        const matched = includes.Entry.find((e: any) => e.sys.id === refItem.sys.id);
        if (matched && matched.fields) {
          const cover_url = resolveCoverUrl(matched.fields, includes);
          const linkedBook = {
            id: matched.sys.id,
            title: matched.fields.title,
            author: matched.fields.author,
            rating: matched.fields.rating ? Number(matched.fields.rating) : 5,
            slug: matched.fields.slug,
            cover_url: cover_url,
            summary: matched.fields.summary || matched.fields.synopsis,
            genre: matched.fields.genre || matched.fields.category
          };

          rankingListItems.push({
            id: `${listEntry.sys.id}_featured_${refItem.sys.id}`,
            listId: listId,
            bookId: linkedBook.id,
            book: linkedBook,
            rank: index + 1,
            season: season,
            listType: "discovery-featured",
            weeksOnList: 1,
            itemType: "book"
          });
        }
      }
    });
  });

  // 3. Fallback generators for completely robust, rich data if CMS is empty or unconfigured
  const isContentfulConnected = rankingItems.length > 0 || rankingListItems.length > 0;
  const combinedItems = [...rankingItems, ...rankingListItems];

  if (extractedLists.length === 0) {
    extractedLists.push({
      id: "default-main-leaderboard",
      title: "Main Scriptorium Leaderboard",
      listType: "top-picks",
      season: "weekly",
      itemType: "book",
      isMain: true
    });
    extractedLists.push({
      id: "sci-fi-classics",
      title: "Pinnacle Sci-Fi Rankings",
      listType: "top-picks",
      season: "monthly",
      itemType: "book",
      isMain: false
    });
    extractedLists.push({
      id: "philosophical-works",
      title: "Deep Philosophical Scrolls",
      listType: "top-picks",
      season: "all-time",
      itemType: "book",
      isMain: false
    });
    extractedLists.push({
      id: "default-discovery-list",
      title: "Scriptorium Discovery Feed",
      listType: "discovery",
      season: "all-time",
      itemType: "book",
      isMain: false
    });
    extractedLists.push({
      id: "default-discovery-featured-list",
      title: "Scriptorium Discovery Featured",
      listType: "discovery-featured",
      season: "all-time",
      itemType: "book",
      isMain: false
    });
  }

  if (combinedItems.length === 0) {
    // Fallback ordered Books disabled - empty array used to prevent dummy content on rankings
    const fallbackBooks: any[] = [];

    fallbackBooks.forEach((book, index) => {
      // Keep ranks completely away from 1-5 (top-picks) and 15-20 (bottom-shelf)
      // Also set listType to "general"
      const rank = (index + 6) >= 15 ? 99 : (index + 6);
      const listType = "general";
      
      let assignedListId = "default-main-leaderboard";
      if (book.id === "dune" || book.id === "the-invisible-man") {
        assignedListId = "sci-fi-classics";
      } else if (book.id === "library-of-babel" || book.id === "foucaults-pendulum") {
        assignedListId = "philosophical-works";
      }

      combinedItems.push({
        id: `fallback-list-item-${book.id}`,
        listId: assignedListId,
        bookId: book.id,
        book: book,
        rank: rank,
        season: "weekly",
        listType: listType,
        weeksOnList: Math.max(1, 10 - rank % 4),
        itemType: "book"
      });

      if (assignedListId !== "default-main-leaderboard") {
        combinedItems.push({
          id: `fallback-list-item-${book.id}-main`,
          listId: "default-main-leaderboard",
          bookId: book.id,
          book: book,
          rank: rank,
          season: "weekly",
          listType: listType,
          weeksOnList: Math.max(1, 10 - rank % 4),
          itemType: "book"
        });
      }
    });

    // Do not add any fallback items for discovery or discovery featured lists to ensure they are empty unless populated from DB
  }

  return { isContentful: isContentfulConnected, data: combinedItems, lists: extractedLists };
}
