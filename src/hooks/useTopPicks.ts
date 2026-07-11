import { useState, useEffect } from "react";
import { Book } from "../types";
import { useBooks } from "./useBooks";

export function useTopPicks() {
  const { books } = useBooks();
  const [topPicks, setTopPicks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchPicks = async () => {
      try {
        const response = await fetch("/api/cms/rankings");
        if (!response.ok) throw new Error("Rankings API error");
        const json = await response.json();
        const rawItems = json.data || [];
        const lists = json.lists || [];
        
        // Find the main/active Top Picks list
        const mainTopPicksList = lists.find((l: any) => l.isMain && (l.listType === "top-picks" || l.listType === "leaderboard"))
          || lists.find((l: any) => l.id === "default-main-leaderboard")
          || lists.find((l: any) => l.listType === "top-picks" || l.listType === "leaderboard");
        const mainListId = mainTopPicksList ? mainTopPicksList.id : null;
        
        // Match items with rank >= 1, listType "top-picks" or "leaderboard", and belongs to the main list
        const uniqueRankingPicks: Book[] = [];
        const seenPicksKeys = new Set<string>();
        
        const rankingPicksRaw = rawItems
          .filter((item: any) => {
            const isBook = !!item.book;
            const isTopPickList = item.listType === "top-picks" || item.listType === "leaderboard";
            const belongsToMainList = !item.listId || !mainListId || item.listId === mainListId;
            return isBook && isTopPickList && belongsToMainList && item.rank >= 1;
          })
          .sort((a: any, b: any) => a.rank - b.rank);

        rankingPicksRaw.forEach((item: any) => {
          const b = { ...item.book };
          const bookId = b.id;
          const bookSlug = b.slug ? b.slug.toLowerCase().trim() : "";
          const bookTitle = b.title ? b.title.toLowerCase().trim() : "";
          
          const duplicateKey = `${bookId}_${bookSlug}_${bookTitle}`;
          const isDuplicate = Array.from(seenPicksKeys).some(k => {
            const [exId, exSlug, exTitle] = k.split("_");
            return exId === bookId || (bookSlug && exSlug === bookSlug) || (bookTitle && exTitle === bookTitle);
          });

          if (!isDuplicate) {
            seenPicksKeys.add(duplicateKey);
            b.top_pick_order = item.rank;
            uniqueRankingPicks.push(b);
          }
        });

        // Filter books from useBooks that are marked as top picks
        const markedPicks = books.filter(b => b.is_top_pick || (b as any).isTopPick || b.category === "top-picks");

        // Merge, avoiding duplicates by id, slug, or title
        const merged = [...uniqueRankingPicks];
        for (const mb of markedPicks) {
          const mbSlug = mb.slug ? mb.slug.toLowerCase().trim() : "";
          const mbTitle = mb.title ? mb.title.toLowerCase().trim() : "";
          
          const isDuplicate = merged.some(x => {
            const xSlug = x.slug ? x.slug.toLowerCase().trim() : "";
            const xTitle = x.title ? x.title.toLowerCase().trim() : "";
            return x.id === mb.id || (mbSlug && xSlug === mbSlug) || (mbTitle && xTitle === mbTitle);
          });
          
          if (!isDuplicate) {
            // Keep the existing top_pick_order, topPickOrder, or rank if present
            const cleanedBook = { ...mb };
            merged.push(cleanedBook);
          }
        }

        // Sort by order/rank to respect Contentful ordering exactly
        merged.sort((a: any, b: any) => {
          const aOrder = a.top_pick_order ?? a.topPickOrder ?? a.rank ?? 999;
          const bOrder = b.top_pick_order ?? b.topPickOrder ?? b.rank ?? 999;
          return Number(aOrder) - Number(bOrder);
        });

        if (active) {
          setTopPicks(merged);
        }
      } catch (err) {
        console.warn("Failed to fetch top picks from rankings API, falling back:", err);
        const fallback = books.filter(b => b.is_top_pick || (b as any).isTopPick || b.category === "top-picks");
        fallback.sort((a: any, b: any) => {
          const aOrder = a.top_pick_order ?? a.topPickOrder ?? a.rank ?? 999;
          const bOrder = b.top_pick_order ?? b.topPickOrder ?? b.rank ?? 999;
          return Number(aOrder) - Number(bOrder);
        });
        if (active) {
          setTopPicks(fallback);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPicks();
    return () => {
      active = false;
    };
  }, [books]);

  return {
    topPicks,
    loading
  };
}

export default useTopPicks;
