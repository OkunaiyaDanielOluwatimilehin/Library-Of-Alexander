import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { Book, getBookSlug } from "../types";
import { useBooks } from "./useBooks";

export function useBook(bookId: string | undefined) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const { books } = useBooks();

  useEffect(() => {
    if (!bookId) {
      setBook(null);
      setLoading(false);
      return;
    }

    const decodedId = decodeURIComponent(bookId);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      const found = books.find(b => b.id === decodedId || getBookSlug(b) === decodedId) || null;
      setBook(found);
      setLoading(false);
      return;
    }

    async function fetchSigleBook() {
      try {
        let data = null;
        let error = null;

        // Try query by ID first
        try {
          const { data: idData, error: idError } = await supabase
            .from("books")
            .select("*")
            .eq("id", decodedId)
            .maybeSingle();
          data = idData;
          error = idError;
        } catch (_) {
          // Ignore range/uuid errors from postgrest
        }

        // If not found or error, try query by slug
        if (error || !data) {
          const { data: slugData, error: slugError } = await supabase
            .from("books")
            .select("*")
            .eq("slug", decodedId)
            .maybeSingle();
          if (slugData) {
            data = slugData;
            error = slugError;
          }
        }

        if (!error && data) {
          setBook(data);
        } else {
          // Check local list
          const found = books.find(b => b.id === decodedId || getBookSlug(b) === decodedId) || null;
          setBook(found);
        }
      } catch (_) {
        const found = books.find(b => b.id === decodedId || getBookSlug(b) === decodedId) || null;
        setBook(found);
      } finally {
        setLoading(false);
      }
    }

    fetchSigleBook();
  }, [bookId, books]);

  return {
    book,
    loading
  };
}
export default useBook;
