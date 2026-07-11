import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { Book } from "../types";

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMarked = (b: Book) => true;

  const loadLocalBooks = (): Book[] => {
    const saved = localStorage.getItem("custom_reviews");
    if (saved) {
      try {
        const parsed: Book[] = JSON.parse(saved);
        return parsed;
      } catch (err) {
        console.error("Failed to parse custom reviews", err);
      }
    }
    return [];
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedBooks: Book[] = [];
      const dbConfigured = isSupabaseConfigured();

      if (dbConfigured) {
        const { data, error: sbErr } = await supabase
          .from("books")
          .select("*")
          .order("created_at", { ascending: false });

        if (!sbErr && data) {
          fetchedBooks = data.map((b: any) => ({
            ...b,
            themes: Array.isArray(b.themes) ? b.themes : [],
            quotes: Array.isArray(b.quotes) ? b.quotes : [],
            reactions: typeof b.reactions === "object" ? b.reactions : { love: 0, agreement: 0 },
            series_books: Array.isArray(b.series_books) ? b.series_books : []
          }));
        } else if (sbErr) {
          console.warn("Supabase books fetch warning:", sbErr.message);
        }
      }

      // If Supabase has zero elements or is not configured, fall back to backend/mock
      if (fetchedBooks.length === 0) {
        try {
          const response = await fetch("/api/cms/reviews");
          if (response.ok) {
            const json = await response.json();
            fetchedBooks = json.data || [];
          }
        } catch (err) {
          console.warn("Express CMS reviews query failed", err);
        }
      }

      // Merge with custom additions in localStorage
      const saved = localStorage.getItem("custom_reviews");
      if (saved) {
        try {
          const parsed: Book[] = JSON.parse(saved);
          const bookMap = new Map(fetchedBooks.map(b => [b.id, b]));
          parsed.forEach(b => {
            if (!bookMap.has(b.id)) {
              fetchedBooks.push(b);
            }
          });
        } catch (_) {}
      }

      setBooks(fetchedBooks);
    } catch (err: any) {
      console.warn("Complete fetch books execution failure:", err);
      setBooks(loadLocalBooks());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const addBook = async (newBook: Omit<Book, "id" | "reviewDate">) => {
    const id = newBook.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`;
    const reviewDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const fullBook: Book = {
      ...newBook,
      id,
      reviewDate,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { error: sbError } = await supabase
          .from("books")
          .insert([fullBook]);
        if (sbError) throw sbError;
      } catch (err: any) {
        console.error("Supabase insert error, saving locally:", err.message);
      }
    }

    // Always keep local copy in sync just in case
    const saved = localStorage.getItem("custom_reviews");
    let localList: Book[] = [];
    if (saved) {
      try {
        localList = JSON.parse(saved);
      } catch (_) {}
    }
    const updatedList = [fullBook, ...localList];
    localStorage.setItem("custom_reviews", JSON.stringify(updatedList));

    setBooks(prev => [fullBook, ...prev]);
    return fullBook;
  };

  return {
    books,
    loading,
    error,
    refresh: fetchBooks,
    addBook
  };
}
export default useBooks;
