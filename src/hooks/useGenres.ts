import { useState, useEffect } from "react";
import { useBooks } from "./useBooks";

export function useGenres() {
  const [genres, setGenres] = useState<string[]>([]);
  const { books, loading } = useBooks();

  useEffect(() => {
    if (books && books.length > 0) {
      const genreSet = new Set<string>();
      books.forEach(b => {
        if (b.genre) {
          const rawGenre = typeof b.genre === "string"
            ? b.genre
            : Array.isArray(b.genre)
            ? (b.genre as string[]).join(", ")
            : String(b.genre);
            
          const parts = rawGenre.split(/[,;|]+/);
          parts.forEach(part => {
            const trimmed = part.trim();
            if (trimmed) {
              // Standardize to Title Case for majestic aesthetic look
              const formatted = trimmed
                .split(/\s+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");
              genreSet.add(formatted);
            }
          });
        }
      });
      const list = Array.from(genreSet).sort((a, b) => a.localeCompare(b));
      setGenres(["All Genres", ...list]);
    } else {
      setGenres(["All Genres"]);
    }
  }, [books]);

  return {
    genres,
    loading
  };
}
export default useGenres;
