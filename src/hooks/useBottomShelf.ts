import { useState, useEffect } from "react";
import { Book } from "../types";
import { useBooks } from "./useBooks";

export function useBottomShelf() {
  const { books } = useBooks();
  const [bottomShelf, setBottomShelf] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchBottom = async () => {
      try {
        const response = await fetch("/api/cms/rankings");
        if (!response.ok) throw new Error("Rankings API error");
        const json = await response.json();
        const rawItems = json.data || [];
        const lists = json.lists || [];
        
        // Find the main/active Bottom Shelf list
        const mainBottomList = lists.find((l: any) => l.isMain && l.listType === "bottom-shelf")
          || lists.find((l: any) => l.listType === "bottom-shelf");
        const mainBottomListId = mainBottomList ? mainBottomList.id : null;
        
        // Match items with rank 15 to 20 and listType "bottom-shelf"
        const uniqueRankingBottom: Book[] = [];
        const seenBottomKeys = new Set<string>();
        
        const rankingBottomRaw = rawItems
          .filter((item: any) => {
            const isBook = !!item.book;
            const isBottomShelf = item.listType === "bottom-shelf";
            const belongsToMainList = !item.listId || !mainBottomListId || item.listId === mainBottomListId;
            return isBook && isBottomShelf && belongsToMainList && item.rank >= 15 && item.rank <= 20;
          })
          .sort((a: any, b: any) => a.rank - b.rank);

        rankingBottomRaw.forEach((item: any) => {
          const b = { ...item.book };
          const bookId = b.id;
          const bookSlug = b.slug ? b.slug.toLowerCase().trim() : "";
          const bookTitle = b.title ? b.title.toLowerCase().trim() : "";
          
          const duplicateKey = `${bookId}_${bookSlug}_${bookTitle}`;
          const isDuplicate = Array.from(seenBottomKeys).some(k => {
            const [exId, exSlug, exTitle] = k.split("_");
            return exId === bookId || (bookSlug && exSlug === bookSlug) || (bookTitle && exTitle === bookTitle);
          });

          if (!isDuplicate) {
            seenBottomKeys.add(duplicateKey);
            b.bottom_shelf_order = item.rank;
            uniqueRankingBottom.push(b);
          }
        });

        // Filter books from useBooks that are marked as bottom shelf
        const markedBottom = books.filter(b => b.is_bottom_shelf || (b as any).isBottomShelf || b.category === "bottom-shelf");

        // Merge, avoiding duplicates by id, slug, or title
        const merged = [...uniqueRankingBottom];
        for (const mb of markedBottom) {
          const mbSlug = mb.slug ? mb.slug.toLowerCase().trim() : "";
          const mbTitle = mb.title ? mb.title.toLowerCase().trim() : "";
          
          const isDuplicate = merged.some(x => {
            const xSlug = x.slug ? x.slug.toLowerCase().trim() : "";
            const xTitle = x.title ? x.title.toLowerCase().trim() : "";
            return x.id === mb.id || (mbSlug && xSlug === mbSlug) || (mbTitle && xTitle === mbTitle);
          });
          
          if (!isDuplicate) {
            // Strip any stale bottom shelf order if it is not from the active rankings API
            const cleanedBook = { ...mb };
            delete (cleanedBook as any).bottom_shelf_order;
            delete (cleanedBook as any).bottomShelfOrder;
            merged.push(cleanedBook);
          }
        }

        // Sort by order/rank to respect Contentful ordering exactly
        merged.sort((a: any, b: any) => {
          const aOrder = a.bottom_shelf_order ?? a.bottomShelfOrder ?? a.top_pick_order ?? a.topPickOrder ?? a.rank ?? 999;
          const bOrder = b.bottom_shelf_order ?? b.bottomShelfOrder ?? b.top_pick_order ?? b.topPickOrder ?? b.rank ?? 999;
          return Number(aOrder) - Number(bOrder);
        });

        if (active) {
          setBottomShelf(merged);
        }
      } catch (err) {
        console.warn("Failed to fetch bottom shelf from rankings API, falling back:", err);
        const fallback = books.filter(b => b.is_bottom_shelf || (b as any).isBottomShelf || b.category === "bottom-shelf");
        fallback.sort((a: any, b: any) => {
          const aOrder = a.bottom_shelf_order ?? a.bottomShelfOrder ?? a.top_pick_order ?? a.topPickOrder ?? a.rank ?? 999;
          const bOrder = b.bottom_shelf_order ?? b.bottomShelfOrder ?? b.top_pick_order ?? b.topPickOrder ?? b.rank ?? 999;
          return Number(aOrder) - Number(bOrder);
        });
        if (active) {
          setBottomShelf(fallback);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchBottom();
    return () => {
      active = false;
    };
  }, [books]);

  return {
    bottomShelf,
    loading
  };
}

export default useBottomShelf;
