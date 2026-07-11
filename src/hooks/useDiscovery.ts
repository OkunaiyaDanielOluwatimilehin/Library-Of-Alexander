import { useState, useEffect } from "react";
import { Book } from "../types";
import { useBooks } from "./useBooks";

export function useDiscovery() {
  const { books } = useBooks();
  const [discoveryBooks, setDiscoveryBooks] = useState<Book[]>([]);
  const [highlights, setHighlights] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchDiscoveryData = async () => {
      try {
        const response = await fetch("/api/cms/rankings");
        if (response.ok) {
          const json = await response.json();
          const items = json.data || [];
          
          // discoveryBooks: items from listType === "discovery" or the list is of type "discovery"
          const rankingDiscovery = items
            .filter((item: any) => item.book && (item.listType === "discovery" || item.listType === "discovery-books"))
            .map((item: any) => item.book);

          // highlights (featured books): items from listType === "discovery-featured" or featured list
          const rankingHighlights = items
            .filter((item: any) => item.book && (item.listType === "discovery-featured" || item.listType === "featured"))
            .map((item: any) => item.book);

          // Filter books from useBooks that are marked as discovery or featured
          const markedDiscovery = books.filter(b => b.is_discovery || (b as any).isDiscovery || b.category === "discovery");
          const markedFeatured = books.filter(b => b.is_featured || (b as any).isFeatured || b.category === "featured" || b.category === "discovery-featured" || b.is_discovery || (b as any).isDiscovery || b.category === "discovery");

          // Merge discovery
          const mergedDiscovery = [...rankingDiscovery];
          for (const mb of markedDiscovery) {
            if (!mergedDiscovery.some(x => x.id === mb.id)) {
              mergedDiscovery.push(mb);
            }
          }

          // Merge highlights
          const mergedHighlights = [...rankingHighlights];
          for (const mb of markedFeatured) {
            if (!mergedHighlights.some(x => x.id === mb.id)) {
              mergedHighlights.push(mb);
            }
          }

          if (active) {
            setDiscoveryBooks(mergedDiscovery);
            setHighlights(mergedHighlights);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch discovery data:", err);
        const fallbackDiscovery = books.filter(b => b.is_discovery || (b as any).isDiscovery || b.category === "discovery");
        const fallbackFeatured = books.filter(b => b.is_featured || (b as any).isFeatured || b.category === "featured" || b.category === "discovery-featured" || b.is_discovery || (b as any).isDiscovery || b.category === "discovery");
        if (active) {
          setDiscoveryBooks(fallbackDiscovery);
          setHighlights(fallbackFeatured);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDiscoveryData();
    return () => {
      active = false;
    };
  }, [books]);

  return {
    discoveryBooks,
    highlights,
    loading
  };
}
export default useDiscovery;
