import { useState, useEffect, useMemo } from "react";
import { Book } from "../types";
import { useBooks } from "./useBooks";

export interface RankingEntry {
  id: string;
  bookId: string;
  book: Book;
  rank: number;
  season: string;
  weeksOnList: number;
  listType: "top-picks" | "bottom-shelf";
}

function getBaseSeason(seasonStr: string): string {
  const s = seasonStr.toLowerCase();
  if (s.startsWith("weekly")) return "weekly";
  if (s.startsWith("summer")) return "summer";
  if (s.startsWith("winter")) return "winter";
  if (s.startsWith("spring")) return "spring";
  if (s.startsWith("autumn")) return "autumn";
  return s;
}

// Conflict Resolution & Shifting Engine with Interactive Time Travel
function resolveRankingConflicts(rawEntries: RankingEntry[], weeksOffset: number = 0): RankingEntry[] {
  const groups: Record<string, RankingEntry[]> = {};
  
  rawEntries.forEach((entry) => {
    const listType = entry.listType || "top-picks";
    const baseSeason = getBaseSeason(entry.season || "weekly");
    
    // We compute the historical weeksOnList
    const historicalWeeks = entry.weeksOnList - weeksOffset;
    if (historicalWeeks < 1) {
      // Discard entries that had not debuted yet!
      return;
    }
    
    const key = `${listType}_${baseSeason}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push({
      ...entry,
      season: baseSeason,
      weeksOnList: historicalWeeks
    });
  });
  
  const resolvedList: RankingEntry[] = [];
  
  Object.keys(groups).forEach((key) => {
    const groupEntries = groups[key];
    
    // Calculate rank without any degradation
    const withDegradedRank = groupEntries.map((e) => {
      // No degradation - strictly keep the assigned rank from Contentful
      const virtualRank = e.rank;
      return {
        entry: e,
        virtualRank
      };
    });
    
    // Sort strictly by rank ascending
    withDegradedRank.sort((a, b) => {
      if (a.entry.rank !== b.entry.rank) {
        return a.entry.rank - b.entry.rank;
      }
      if (a.entry.weeksOnList !== b.entry.weeksOnList) {
        return b.entry.weeksOnList - a.entry.weeksOnList; // Prefer longer-running if same rank
      }
      const ratingA = a.entry.book?.rating || 0;
      const ratingB = b.entry.book?.rating || 0;
      return ratingB - ratingA;
    });
    
    // Assign ranks preserving the original ranking order exactly
    const capped = withDegradedRank.slice(0, 20);
    capped.forEach((item) => {
      resolvedList.push({
        ...item.entry,
        rank: item.entry.rank
      });
    });
  });
  
  return resolvedList;
}

export function useRankings() {
  const [rawRankings, setRawRankings] = useState<RankingEntry[]>([]);
  const [weeksOffset, setWeeksOffset] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { books, loading: booksLoading } = useBooks();

  const fetchRankings = async () => {
    if (booksLoading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cms/rankings");
      if (!response.ok) throw new Error("CMS rankings endpoint status failure");
      const json = await response.json();
      
      let cmsRankings: any[] = json.data || [];
      
      // Override/Merge with customized lists edited in our Admin Panel CMS
      const customRankingsSaved = localStorage.getItem("cms_live_synchronized_rankings");
      if (customRankingsSaved) {
        try {
          const parsed = JSON.parse(customRankingsSaved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const customKeys = new Set(parsed.map(p => `${p.season || "weekly"}_${p.listType || "top-picks"}`));
            cmsRankings = [
              ...parsed,
              ...cmsRankings.filter(r => !customKeys.has(`${r.season || "weekly"}_${r.listType || "top-picks"}`))
            ];
          }
        } catch (_) {}
      }

      const mapped: RankingEntry[] = cmsRankings.map((r) => {
        const bookMatch = books.find(b => b.id === r.bookId || b.id === r.book?.id);
        const finalBook = bookMatch || r.book;
        return {
          id: r.id,
          bookId: r.bookId || finalBook?.id,
          book: finalBook,
          rank: r.rank || 1,
          season: r.season || "weekly",
          weeksOnList: r.weeksOnList || 1,
          listType: r.listType || "top-picks"
        };
      }).filter(r => r.book);
      
      setRawRankings(mapped);
    } catch (err: any) {
      console.warn("Express CMS rankings query failed, zeroing dataset:", err);
      setRawRankings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!booksLoading) {
      fetchRankings();
    }
  }, [books, booksLoading]);

  // Reactive resolved rankings based on the selected historical weeks offset
  const rankings = useMemo(() => {
    return resolveRankingConflicts(rawRankings, weeksOffset);
  }, [rawRankings, weeksOffset]);

  return {
    rankings,
    loading: loading || booksLoading,
    error,
    weeksOffset,
    setWeeksOffset,
    refresh: fetchRankings
  };
}
